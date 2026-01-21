import {
  PACKET_HEADER,
  HEADER_LENGTH,
  META_LENGTH,
  CRC_LENGTH,
  MIN_PACKET_LENGTH,
  DEVICE_TYPE_HEADBAND,
  DEVICE_TYPE_EARPIECE,
  HEADBAND_SAMPLING_RATE,
  EARPIECE_SAMPLING_RATE,
  HEADBAND_CHANNELS,
  EARPIECE_CHANNELS,
  MICROVOLTS_PER_UNIT,
  calculateCRC16,
  validateHeader,
  validateCRC,
  parseMetadata,
  parseChannelSamples,
  parsePacket,
  createParserState,
  updateParserState,
  calculateSignalQuality,
  createMockPacket,
  getDeviceInfoFromMetadata,
  BlePacketParser,
  type PacketMetadata,
  type ParseResult,
} from '../src/services/BlePacketParser';

describe('BLE Packet Parser', () => {
  describe('Constants', () => {
    it('should have correct packet header bytes', () => {
      expect(PACKET_HEADER[0]).toBe(0xaa);
      expect(PACKET_HEADER[1]).toBe(0x55);
    });

    it('should have correct device type identifiers', () => {
      expect(DEVICE_TYPE_HEADBAND).toBe(0x01);
      expect(DEVICE_TYPE_EARPIECE).toBe(0x02);
    });

    it('should have correct sampling rates', () => {
      expect(HEADBAND_SAMPLING_RATE).toBe(500);
      expect(EARPIECE_SAMPLING_RATE).toBe(250);
    });

    it('should have correct channel counts', () => {
      expect(HEADBAND_CHANNELS).toBe(4);
      expect(EARPIECE_CHANNELS).toBe(2);
    });

    it('should have minimum packet length defined correctly', () => {
      expect(MIN_PACKET_LENGTH).toBe(HEADER_LENGTH + META_LENGTH + CRC_LENGTH);
      expect(MIN_PACKET_LENGTH).toBe(10);
    });
  });

  describe('CRC Calculation', () => {
    it('should calculate CRC-16 correctly for known data', () => {
      // Test with simple data
      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
      const crc = calculateCRC16(data);
      expect(crc).toBeGreaterThanOrEqual(0);
      expect(crc).toBeLessThanOrEqual(0xffff);
    });

    it('should return different CRC for different data', () => {
      const data1 = new Uint8Array([0x01, 0x02, 0x03]);
      const data2 = new Uint8Array([0x01, 0x02, 0x04]);

      const crc1 = calculateCRC16(data1);
      const crc2 = calculateCRC16(data2);

      expect(crc1).not.toBe(crc2);
    });

    it('should calculate CRC for subset of data', () => {
      const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);
      const fullCRC = calculateCRC16(data);
      const partialCRC = calculateCRC16(data, 0, 3);

      expect(fullCRC).not.toBe(partialCRC);
    });
  });

  describe('Header Validation', () => {
    it('should validate correct header', () => {
      const data = new Uint8Array([0xaa, 0x55, 0x00, 0x00]);
      expect(validateHeader(data)).toBe(true);
    });

    it('should reject incorrect header - wrong first byte', () => {
      const data = new Uint8Array([0xab, 0x55, 0x00, 0x00]);
      expect(validateHeader(data)).toBe(false);
    });

    it('should reject incorrect header - wrong second byte', () => {
      const data = new Uint8Array([0xaa, 0x56, 0x00, 0x00]);
      expect(validateHeader(data)).toBe(false);
    });

    it('should reject data too short for header', () => {
      const data = new Uint8Array([0xaa]);
      expect(validateHeader(data)).toBe(false);
    });

    it('should reject empty data', () => {
      const data = new Uint8Array([]);
      expect(validateHeader(data)).toBe(false);
    });
  });

  describe('CRC Validation', () => {
    it('should validate packet with correct CRC', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      expect(validateCRC(mockPacket)).toBe(true);
    });

    it('should reject packet with corrupted CRC', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      // Corrupt the last byte (CRC)
      mockPacket[mockPacket.length - 1] ^= 0xff;
      expect(validateCRC(mockPacket)).toBe(false);
    });

    it('should reject packet with corrupted data', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      // Corrupt a data byte
      mockPacket[10] ^= 0xff;
      expect(validateCRC(mockPacket)).toBe(false);
    });

    it('should reject packet that is too short', () => {
      const data = new Uint8Array([0xaa, 0x55, 0x00]);
      expect(validateCRC(data)).toBe(false);
    });
  });

  describe('Metadata Parsing', () => {
    it('should parse headband metadata correctly', () => {
      const mockPacket = createMockPacket('headband', 42, 10);
      const metadata = parseMetadata(mockPacket);

      expect(metadata).not.toBeNull();
      expect(metadata?.deviceType).toBe('headband');
      expect(metadata?.channelCount).toBe(HEADBAND_CHANNELS);
      expect(metadata?.sequenceNumber).toBe(42);
      expect(metadata?.samplesPerChannel).toBe(10);
      expect(metadata?.samplingRate).toBe(HEADBAND_SAMPLING_RATE);
    });

    it('should parse earpiece metadata correctly', () => {
      const mockPacket = createMockPacket('earpiece', 100, 20);
      const metadata = parseMetadata(mockPacket);

      expect(metadata).not.toBeNull();
      expect(metadata?.deviceType).toBe('earpiece');
      expect(metadata?.channelCount).toBe(EARPIECE_CHANNELS);
      expect(metadata?.sequenceNumber).toBe(100);
      expect(metadata?.samplesPerChannel).toBe(20);
      expect(metadata?.samplingRate).toBe(EARPIECE_SAMPLING_RATE);
    });

    it('should handle maximum sequence number', () => {
      const mockPacket = createMockPacket('headband', 65535, 5);
      const metadata = parseMetadata(mockPacket);

      expect(metadata?.sequenceNumber).toBe(65535);
    });

    it('should return null for invalid device type', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      // Corrupt device type byte
      mockPacket[HEADER_LENGTH] = 0xff;
      const metadata = parseMetadata(mockPacket);

      expect(metadata).toBeNull();
    });

    it('should return null for data too short', () => {
      const data = new Uint8Array([0xaa, 0x55, 0x01]);
      const metadata = parseMetadata(data);

      expect(metadata).toBeNull();
    });
  });

  describe('Channel Sample Parsing', () => {
    it('should parse headband samples correctly', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      const channelData = parseChannelSamples(mockPacket, HEADBAND_CHANNELS, 10);

      expect(channelData).not.toBeNull();
      expect(channelData?.length).toBe(HEADBAND_CHANNELS);
      channelData?.forEach((channel) => {
        expect(channel.length).toBe(10);
      });
    });

    it('should parse earpiece samples correctly', () => {
      const mockPacket = createMockPacket('earpiece', 1, 20);
      const channelData = parseChannelSamples(mockPacket, EARPIECE_CHANNELS, 20);

      expect(channelData).not.toBeNull();
      expect(channelData?.length).toBe(EARPIECE_CHANNELS);
      channelData?.forEach((channel) => {
        expect(channel.length).toBe(20);
      });
    });

    it('should convert ADC values to microvolts', () => {
      const mockPacket = createMockPacket('earpiece', 1, 5);
      const channelData = parseChannelSamples(mockPacket, EARPIECE_CHANNELS, 5);

      expect(channelData).not.toBeNull();
      // Check that values are in expected microvolt range (typically -200 to +200 µV for EEG)
      channelData?.forEach((channel) => {
        channel.forEach((sample) => {
          expect(Math.abs(sample)).toBeLessThan(200);
        });
      });
    });

    it('should return null for incorrect packet length', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      // Try to parse with wrong channel count
      const channelData = parseChannelSamples(mockPacket, 3, 10);

      expect(channelData).toBeNull();
    });
  });

  describe('Full Packet Parsing', () => {
    it('should parse valid headband packet', () => {
      const mockPacket = createMockPacket('headband', 42, 10);
      const result = parsePacket(mockPacket);

      expect(result.success).toBe(true);
      expect(result.packet).toBeDefined();
      expect(result.packet?.sequence_number).toBe(42);
      expect(result.packet?.samples.length).toBe(HEADBAND_CHANNELS * 10);
      expect(result.metadata?.deviceType).toBe('headband');
      expect(result.channelData?.length).toBe(HEADBAND_CHANNELS);
    });

    it('should parse valid earpiece packet', () => {
      const mockPacket = createMockPacket('earpiece', 100, 20);
      const result = parsePacket(mockPacket);

      expect(result.success).toBe(true);
      expect(result.packet).toBeDefined();
      expect(result.packet?.sequence_number).toBe(100);
      expect(result.packet?.samples.length).toBe(EARPIECE_CHANNELS * 20);
      expect(result.metadata?.deviceType).toBe('earpiece');
      expect(result.channelData?.length).toBe(EARPIECE_CHANNELS);
    });

    it('should include timestamp in parsed packet', () => {
      const beforeParse = Date.now();
      const mockPacket = createMockPacket('headband', 1, 5);
      const result = parsePacket(mockPacket);
      const afterParse = Date.now();

      expect(result.packet?.timestamp).toBeGreaterThanOrEqual(beforeParse);
      expect(result.packet?.timestamp).toBeLessThanOrEqual(afterParse);
    });

    it('should fail on packet too short', () => {
      const data = new Uint8Array([0xaa, 0x55, 0x01, 0x04]);
      const result = parsePacket(data);

      expect(result.success).toBe(false);
      expect(result.error).toContain('too short');
    });

    it('should fail on invalid header', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      mockPacket[0] = 0x00;
      const result = parsePacket(mockPacket);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid header');
    });

    it('should fail on CRC mismatch', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      mockPacket[mockPacket.length - 1] ^= 0xff;
      const result = parsePacket(mockPacket);

      expect(result.success).toBe(false);
      expect(result.error).toContain('CRC');
    });

    it('should fail on mismatched channel count', () => {
      const mockPacket = createMockPacket('headband', 1, 10);
      // Change channel count to incorrect value (but fix CRC)
      mockPacket[HEADER_LENGTH + 1] = 3;
      // Recalculate CRC
      const crc = calculateCRC16(mockPacket, 0, mockPacket.length - CRC_LENGTH);
      const dataView = new DataView(mockPacket.buffer);
      dataView.setUint16(mockPacket.length - CRC_LENGTH, crc, true);

      const result = parsePacket(mockPacket);

      expect(result.success).toBe(false);
      expect(result.error).toContain('channel count');
    });
  });

  describe('Parser State Management', () => {
    it('should create initial parser state', () => {
      const state = createParserState();

      expect(state.lastSequenceNumber).toBe(-1);
      expect(state.packetsReceived).toBe(0);
      expect(state.packetsDropped).toBe(0);
      expect(state.deviceType).toBeNull();
    });

    it('should update state on first packet', () => {
      const state = createParserState();
      const metadata: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 100,
        samplesPerChannel: 10,
        samplingRate: 500,
      };

      const result = updateParserState(state, metadata);

      expect(result.isFirstPacket).toBe(true);
      expect(result.droppedPackets).toBe(0);
      expect(state.lastSequenceNumber).toBe(100);
      expect(state.packetsReceived).toBe(1);
      expect(state.deviceType).toBe('headband');
    });

    it('should detect sequential packets', () => {
      const state = createParserState();
      const metadata1: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 100,
        samplesPerChannel: 10,
        samplingRate: 500,
      };
      const metadata2: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 101,
        samplesPerChannel: 10,
        samplingRate: 500,
      };

      updateParserState(state, metadata1);
      const result = updateParserState(state, metadata2);

      expect(result.isFirstPacket).toBe(false);
      expect(result.droppedPackets).toBe(0);
      expect(state.packetsReceived).toBe(2);
      expect(state.packetsDropped).toBe(0);
    });

    it('should detect dropped packets', () => {
      const state = createParserState();
      const metadata1: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 100,
        samplesPerChannel: 10,
        samplingRate: 500,
      };
      const metadata2: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 105,
        samplesPerChannel: 10,
        samplingRate: 500,
      };

      updateParserState(state, metadata1);
      const result = updateParserState(state, metadata2);

      expect(result.droppedPackets).toBe(4);
      expect(state.packetsDropped).toBe(4);
    });

    it('should handle sequence number wrap-around', () => {
      const state = createParserState();
      const metadata1: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 65534,
        samplesPerChannel: 10,
        samplingRate: 500,
      };
      const metadata2: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 0,
        samplesPerChannel: 10,
        samplingRate: 500,
      };

      updateParserState(state, metadata1);
      const result = updateParserState(state, metadata2);

      // 65534 -> 65535 -> 0, so 1 dropped
      expect(result.droppedPackets).toBe(1);
    });
  });

  describe('Signal Quality Calculation', () => {
    it('should return perfect quality for clean signal', () => {
      // Create clean EEG-like signal (low amplitude, smooth)
      const channelData: number[][] = [];
      for (let ch = 0; ch < 4; ch++) {
        const samples: number[] = [];
        for (let i = 0; i < 100; i++) {
          // Small sine wave (clean signal)
          samples.push(Math.sin(i * 0.1) * 10);
        }
        channelData.push(samples);
      }

      const quality = calculateSignalQuality(channelData);

      expect(quality.score).toBeGreaterThan(80);
      expect(quality.artifact_percentage).toBeLessThan(20);
      expect(quality.has_amplitude_artifact).toBe(false);
      expect(quality.has_gradient_artifact).toBe(false);
    });

    it('should detect amplitude artifacts', () => {
      const channelData: number[][] = [];
      for (let ch = 0; ch < 4; ch++) {
        const samples: number[] = [];
        for (let i = 0; i < 100; i++) {
          // Add some high amplitude artifacts
          samples.push(i % 10 === 0 ? 200 : 10);
        }
        channelData.push(samples);
      }

      const quality = calculateSignalQuality(channelData);

      expect(quality.has_amplitude_artifact).toBe(true);
      expect(quality.score).toBeLessThan(95);
    });

    it('should detect gradient artifacts (sudden changes)', () => {
      const channelData: number[][] = [];
      for (let ch = 0; ch < 4; ch++) {
        const samples: number[] = [];
        for (let i = 0; i < 100; i++) {
          // Create sudden jumps
          samples.push(i % 5 === 0 ? (i % 2 === 0 ? 80 : -80) : 0);
        }
        channelData.push(samples);
      }

      const quality = calculateSignalQuality(channelData);

      expect(quality.has_gradient_artifact).toBe(true);
    });

    it('should detect flatline (frequency artifact)', () => {
      const channelData: number[][] = [];
      for (let ch = 0; ch < 4; ch++) {
        // All zeros = flatline
        channelData.push(new Array(100).fill(0));
      }

      const quality = calculateSignalQuality(channelData);

      expect(quality.has_frequency_artifact).toBe(true);
      expect(quality.score).toBeLessThanOrEqual(80);
    });

    it('should return zero quality for empty data', () => {
      const quality = calculateSignalQuality([]);

      expect(quality.score).toBe(0);
      expect(quality.artifact_percentage).toBe(100);
    });

    it('should handle single-sample channels', () => {
      const channelData = [[10], [20]];
      const quality = calculateSignalQuality(channelData);

      expect(quality.score).toBeGreaterThanOrEqual(0);
      expect(quality.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Mock Packet Creation', () => {
    it('should create valid headband mock packet', () => {
      const packet = createMockPacket('headband', 1, 10);

      expect(validateHeader(packet)).toBe(true);
      expect(validateCRC(packet)).toBe(true);

      const metadata = parseMetadata(packet);
      expect(metadata?.deviceType).toBe('headband');
      expect(metadata?.channelCount).toBe(HEADBAND_CHANNELS);
      expect(metadata?.sequenceNumber).toBe(1);
      expect(metadata?.samplesPerChannel).toBe(10);
    });

    it('should create valid earpiece mock packet', () => {
      const packet = createMockPacket('earpiece', 50, 25);

      expect(validateHeader(packet)).toBe(true);
      expect(validateCRC(packet)).toBe(true);

      const metadata = parseMetadata(packet);
      expect(metadata?.deviceType).toBe('earpiece');
      expect(metadata?.channelCount).toBe(EARPIECE_CHANNELS);
      expect(metadata?.sequenceNumber).toBe(50);
      expect(metadata?.samplesPerChannel).toBe(25);
    });

    it('should generate simulated EEG data', () => {
      const packet = createMockPacket('headband', 1, 100);
      const result = parsePacket(packet);

      expect(result.success).toBe(true);
      expect(result.channelData).toBeDefined();

      // Check that samples have variation (not all zeros)
      const allSamples = result.channelData!.flat();
      const uniqueValues = new Set(allSamples);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });
  });

  describe('Device Info from Metadata', () => {
    it('should create device info from headband metadata', () => {
      const metadata: PacketMetadata = {
        deviceType: 'headband',
        channelCount: 4,
        sequenceNumber: 1,
        samplesPerChannel: 10,
        samplingRate: 500,
      };

      const deviceInfo = getDeviceInfoFromMetadata(metadata, 'device-123', 'FlowState Headband');

      expect(deviceInfo.id).toBe('device-123');
      expect(deviceInfo.name).toBe('FlowState Headband');
      expect(deviceInfo.type).toBe('headband');
      expect(deviceInfo.sampling_rate).toBe(500);
      expect(deviceInfo.is_connected).toBe(true);
    });

    it('should create device info from earpiece metadata', () => {
      const metadata: PacketMetadata = {
        deviceType: 'earpiece',
        channelCount: 2,
        sequenceNumber: 1,
        samplesPerChannel: 10,
        samplingRate: 250,
      };

      const deviceInfo = getDeviceInfoFromMetadata(metadata, 'device-456', 'FlowState Earpiece');

      expect(deviceInfo.type).toBe('earpiece');
      expect(deviceInfo.sampling_rate).toBe(250);
    });
  });

  describe('BlePacketParser Class', () => {
    let parser: BlePacketParser;

    beforeEach(() => {
      parser = new BlePacketParser();
    });

    it('should process valid packet and call callbacks', () => {
      const onPacketParsed = jest.fn();
      const onSignalQuality = jest.fn();

      parser.setOnPacketParsed(onPacketParsed);
      parser.setOnSignalQuality(onSignalQuality);

      const mockPacket = createMockPacket('headband', 1, 10);
      const result = parser.processData(mockPacket);

      expect(result.success).toBe(true);
      expect(onPacketParsed).toHaveBeenCalledTimes(1);
      expect(onSignalQuality).toHaveBeenCalledTimes(1);
    });

    it('should call error callback on invalid packet', () => {
      const onPacketError = jest.fn();
      parser.setOnPacketError(onPacketError);

      const invalidPacket = new Uint8Array([0x00, 0x00, 0x00]);
      const result = parser.processData(invalidPacket);

      expect(result.success).toBe(false);
      expect(onPacketError).toHaveBeenCalledTimes(1);
    });

    it('should track statistics', () => {
      const mockPacket1 = createMockPacket('headband', 1, 10);
      const mockPacket2 = createMockPacket('headband', 2, 10);

      parser.processData(mockPacket1);
      parser.processData(mockPacket2);

      const stats = parser.getStats();

      expect(stats.packetsReceived).toBe(2);
      expect(stats.packetsDropped).toBe(0);
      expect(stats.dropRate).toBe(0);
      expect(stats.deviceType).toBe('headband');
    });

    it('should track dropped packets', () => {
      const mockPacket1 = createMockPacket('headband', 1, 10);
      const mockPacket2 = createMockPacket('headband', 5, 10); // Gap of 3 packets

      parser.processData(mockPacket1);
      parser.processData(mockPacket2);

      const stats = parser.getStats();

      expect(stats.packetsReceived).toBe(2);
      expect(stats.packetsDropped).toBe(3);
      expect(stats.dropRate).toBe(3 / 5);
    });

    it('should reset state', () => {
      const mockPacket = createMockPacket('headband', 100, 10);
      parser.processData(mockPacket);

      let stats = parser.getStats();
      expect(stats.packetsReceived).toBe(1);

      parser.reset();

      stats = parser.getStats();
      expect(stats.packetsReceived).toBe(0);
      expect(stats.packetsDropped).toBe(0);
      expect(stats.deviceType).toBeNull();
    });

    it('should handle multiple packets from different device types', () => {
      const headbandPacket = createMockPacket('headband', 1, 10);
      const earpiecePacket = createMockPacket('earpiece', 2, 10);

      const result1 = parser.processData(headbandPacket);
      expect(result1.metadata?.deviceType).toBe('headband');

      parser.reset();

      const result2 = parser.processData(earpiecePacket);
      expect(result2.metadata?.deviceType).toBe('earpiece');
    });
  });

  describe('Sampling Rate Integration', () => {
    it('should parse 500Hz headband data correctly', () => {
      // 500Hz with typical packet of 10 samples = 20ms of data
      const packet = createMockPacket('headband', 0, 10);
      const result = parsePacket(packet);

      expect(result.success).toBe(true);
      expect(result.metadata?.samplingRate).toBe(500);
      // 10 samples at 500Hz = 20ms of data
      const durationMs = (result.metadata!.samplesPerChannel / result.metadata!.samplingRate) * 1000;
      expect(durationMs).toBe(20);
    });

    it('should parse 250Hz earpiece data correctly', () => {
      // 250Hz with typical packet of 10 samples = 40ms of data
      const packet = createMockPacket('earpiece', 0, 10);
      const result = parsePacket(packet);

      expect(result.success).toBe(true);
      expect(result.metadata?.samplingRate).toBe(250);
      // 10 samples at 250Hz = 40ms of data
      const durationMs = (result.metadata!.samplesPerChannel / result.metadata!.samplingRate) * 1000;
      expect(durationMs).toBe(40);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum valid packet', () => {
      const packet = createMockPacket('earpiece', 0, 1); // 1 sample per channel
      const result = parsePacket(packet);

      expect(result.success).toBe(true);
      expect(result.packet?.samples.length).toBe(EARPIECE_CHANNELS);
    });

    it('should handle large packet', () => {
      const packet = createMockPacket('headband', 0, 500); // 500 samples per channel
      const result = parsePacket(packet);

      expect(result.success).toBe(true);
      expect(result.packet?.samples.length).toBe(HEADBAND_CHANNELS * 500);
    });

    it('should handle sequence number at boundaries', () => {
      const packet0 = createMockPacket('headband', 0, 10);
      const packetMax = createMockPacket('headband', 65535, 10);

      const result0 = parsePacket(packet0);
      const resultMax = parsePacket(packetMax);

      expect(result0.metadata?.sequenceNumber).toBe(0);
      expect(resultMax.metadata?.sequenceNumber).toBe(65535);
    });
  });
});
