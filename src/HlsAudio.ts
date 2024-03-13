import ConfigProvider from '../common/ConfigProvider';
import {join} from 'path';
import BitmovinApi, {
    AacAudioConfiguration,
    AacChannelLayout,
    AclEntry,
    AclPermission, AudioMediaInfo,
    CodecConfiguration,
    ConsoleLogger,
    DolbyDigitalAudioConfiguration,
    DolbyDigitalChannelLayout,
    Encoding,
    EncodingOutput,
    Fmp4Muxing,
    H264VideoConfiguration, HeAacV1AudioConfiguration, HeAacV2AudioConfiguration,
    HlsManifest,
    HttpInput,
    Input,
    Manifest,
    ManifestGenerator,
    ManifestResource,
    MessageType, Muxing,
    MuxingStream,
    Output,
    PresetConfiguration,
    S3Output,
    StartEncodingRequest,
    Status,
    Stream, StreamInfo,
    StreamInput,
    StreamSelectionMode,
    Task
} from '@bitmovin/api-sdk';

const exampleName = 'HLS-Multiple-Audio-Layers';

const configProvider: ConfigProvider = new ConfigProvider();

const bitmovinApi: BitmovinApi = new BitmovinApi({
    apiKey: configProvider.getBitmovinApiKey(),
    // uncomment the following line if you are working with a multi-tenant account
    // tenantOrgId: configProvider.getBitmovinTenantOrgId(),
    logger: new ConsoleLogger()
});
const AacStereoGroupName = 'AAC-LC-Stereo';
const AacHe1GroupName = 'AAC-HE-V1-Stereo'
const AacHe2GroupName = 'AAC-HE-V2-Stereo'
const Aac5_1GroupName = 'AAC-LC-5.1';
const dolbyGroupName = 'AC-3-5.1';

interface VideoConfig {
    videoConfiguration: H264VideoConfiguration,
    videoStream: Stream,
    muxing: Fmp4Muxing,
    segPath: string
}

interface AudioConfig {
    id: string,
    stream: Stream,
    muxing: Fmp4Muxing,
    lang: string,
    segPath: string,
    groupId: string,
    HlsName: string
}

async function main() {
    const encoding = await createEncoding(
        'Encoding with HLS Audio Layers',
        'Encoding with HLS manifest'
    );

    const input = await createHttpInput(configProvider.getHttpInputHost());
    const inputFilePath = configProvider.getHttpInputFilePath()
    const audioFileInputPathEn = configProvider.getHttpInputFilePathWithAC3EnglishSurroundSound();
    const audioFileInputPathEs = configProvider.getHttpInputFilePathWithAC3SpanishSurroundSound();


    const output = await createS3Output(
        configProvider.getS3OutputBucketName(),
        configProvider.getS3OutputAccessKey(),
        configProvider.getS3OutputSecretKey()
    );

    // ABR Ladder - H264
    const videoConfigurations = [
        await createH264VideoConfig(1280, 720, 3000000),
    ];

    let vidConfigs: VideoConfig[] = [];
    for (const videoConfig of videoConfigurations) {
        const videoStream = await createStream(encoding, input, inputFilePath, videoConfig);
        const muxing = await createFmp4Muxing(encoding, output, `video/${videoConfig.bitrate}`, videoStream);
        vidConfigs.push({videoConfiguration: videoConfig, videoStream: videoStream, muxing: muxing, segPath: `video/${videoConfig.bitrate}`});
    }

    // Audio
    let audioConfigs: AudioConfig[] = [];

    // AAC-LC Stereo
    const aacStereoConfig = await createAacAudioConfig(64000, AacChannelLayout.CL_STEREO);
    const aacStream = await createStream(encoding, input, audioFileInputPathEn, aacStereoConfig);
    const aacMuxing = await createFmp4Muxing(encoding, output, `audio/aac/stereo/${aacStereoConfig.bitrate}`, aacStream);
    audioConfigs.push({id: 'audio_aaclc_stereo', stream: aacStream, muxing: aacMuxing, segPath: `audio/aac/stereo/${aacStereoConfig.bitrate}`, lang: 'en', groupId: AacStereoGroupName, HlsName: 'English-Stereo'});

    const aacStreamEs = await createStream(encoding, input, audioFileInputPathEs, aacStereoConfig);
    const aacMuxingEs = await createFmp4Muxing(encoding, output, `audio/aac/stereo/es/${aacStereoConfig.bitrate}`, aacStreamEs);
    audioConfigs.push({id: 'audio_aaclc_stereo_es', stream: aacStreamEs, muxing: aacMuxingEs, segPath: `audio/aac/stereo/es/${aacStereoConfig.bitrate}`, lang: 'es', groupId: AacStereoGroupName, HlsName: 'Spanish-Stereo'});


    // HEv1 Stereo
    const aacHe1StereoConfig = await createAacHE1Config(64000, AacChannelLayout.CL_STEREO);
    const aacHe1Stream = await createStream(encoding, input, audioFileInputPathEn, aacHe1StereoConfig);
    const aacHe1Muxing = await createFmp4Muxing(encoding, output, `audio/aac/stereo/${aacHe1StereoConfig.bitrate}`, aacHe1Stream);
    audioConfigs.push({id: 'audio_aache1_stereo', stream: aacHe1Stream, muxing: aacHe1Muxing, segPath: `audio/aac/stereo/${aacHe1StereoConfig.bitrate}`, lang: 'en', groupId: AacHe1GroupName, HlsName: 'English-Stereo'});

    const aacHe1StreamEs = await createStream(encoding, input, audioFileInputPathEs, aacHe1StereoConfig);
    const aacHe1MuxingEs = await createFmp4Muxing(encoding, output, `audio/aac/stereo/es/${aacHe1StereoConfig.bitrate}`, aacHe1StreamEs);
    audioConfigs.push({id: 'audio_aache1_stereo_es', stream: aacHe1StreamEs, muxing: aacHe1MuxingEs, segPath: `audio/aac/stereo/es/${aacHe1StereoConfig.bitrate}`, lang: 'es', groupId: AacHe1GroupName, HlsName: 'Spanish-Stereo'});


    // HEv2 Stereo
    const aacHe2StereoConfig = await createAacHE2Config(32000, AacChannelLayout.CL_STEREO);
    const aacHe2Stream = await createStream(encoding, input, audioFileInputPathEn, aacHe2StereoConfig);
    const aacHe2Muxing = await createFmp4Muxing(encoding, output, `audio/aac/stereo/${aacHe2StereoConfig.bitrate}`, aacHe2Stream);
    audioConfigs.push({id: 'audio_aache2_stereo', stream: aacHe2Stream, muxing: aacHe2Muxing, segPath: `audio/aac/stereo/${aacHe2StereoConfig.bitrate}`, lang: 'en', groupId: AacHe2GroupName, HlsName: 'English-Stereo'});

    const aacHe2StreamEs = await createStream(encoding, input, audioFileInputPathEs, aacHe2StereoConfig);
    const aacHe2MuxingEs = await createFmp4Muxing(encoding, output, `audio/aac/stereo/es/${aacHe2StereoConfig.bitrate}`, aacHe2StreamEs);
    audioConfigs.push({id: 'audio_aache2_stereo_es', stream: aacHe2StreamEs, muxing: aacHe2MuxingEs, segPath: `audio/aac/stereo/es/${aacHe2StereoConfig.bitrate}`, lang: 'es', groupId: AacHe2GroupName, HlsName: 'Spanish-Stereo'});


    //AAC-LC 5.1
    const aac5_1Config = await createAacAudioConfig(320000, AacChannelLayout.CL_5_1_BACK);
    const aac5_1Stream = await createStream(encoding, input, audioFileInputPathEn, aac5_1Config);
    const aac5_1Muxing = await createFmp4Muxing(encoding, output, `audio/aac/5_1/${aac5_1Config.bitrate}`, aac5_1Stream);
    audioConfigs.push({id: 'audio_aaclc-5_1', stream: aac5_1Stream, muxing: aac5_1Muxing, segPath: `audio/aac/5_1/${aac5_1Config.bitrate}`, lang: 'en', groupId: Aac5_1GroupName, HlsName: 'English-5.1'});

    const aac5_1StreamEs = await createStream(encoding, input, audioFileInputPathEs, aac5_1Config);
    const aac5_1MuxingEs = await createFmp4Muxing(encoding, output, `audio/aac/5_1/es/${aac5_1Config.bitrate}`, aac5_1StreamEs);
    audioConfigs.push({id: 'audio_aaclc-5_1_es', stream: aac5_1StreamEs, muxing: aac5_1MuxingEs, segPath: `audio/aac/5_1/es/${aac5_1Config.bitrate}`, lang: 'es', groupId: Aac5_1GroupName, HlsName: 'Spanish-5.1'});


    // AC-3 5.1
    const dolbyDigitalConfig = await createDolbyDigitalAudioConfig();
    const dolbyDigitalStream =  await createStream(encoding, input, audioFileInputPathEn, dolbyDigitalConfig);
    const dolbyDigitalMuxing = await createFmp4Muxing(encoding, output, `audio/dolby/${dolbyDigitalConfig.bitrate}`, dolbyDigitalStream);
    audioConfigs.push({id: 'dolby-ac3-5_1', stream: dolbyDigitalStream, muxing: dolbyDigitalMuxing, segPath: `audio/dolby/${dolbyDigitalConfig.bitrate}`, lang: 'en', groupId: dolbyGroupName, HlsName: 'English-Dolby'});

    const dolbyDigitalStreamEs =  await createStream(encoding, input, audioFileInputPathEs, dolbyDigitalConfig);
    const dolbyDigitalMuxingEs = await createFmp4Muxing(encoding, output, `audio/dolby/es/${dolbyDigitalConfig.bitrate}`, dolbyDigitalStreamEs);
    audioConfigs.push({id: 'dolby-ac3-5_1_es', stream: dolbyDigitalStreamEs, muxing: dolbyDigitalMuxingEs, segPath: `audio/dolby/es/${dolbyDigitalConfig.bitrate}`, lang: 'es', groupId: dolbyGroupName, HlsName: 'Spanish-Dolby'});

    let hlsManifest = await createHlsManifest(encoding, output,
        audioConfigs,
        vidConfigs
    );

    const startEncodingRequest = new StartEncodingRequest({
        manifestGenerator: ManifestGenerator.V2,
        vodHlsManifests: [buildManifestResource(hlsManifest)]
    });

    await executeEncoding(encoding, startEncodingRequest);
}

// Helper Methods
async function createHlsManifest(encoding:Encoding, output: Output,
                                 audioConfigs: AudioConfig[],
                                 h264Variants: VideoConfig[]
): Promise<HlsManifest> {
    const hlsManifest = await createHlsMasterManifest('master.m3u8', output, '/');

    let uniqueAudioGroups: string[] = [AacStereoGroupName, Aac5_1GroupName, AacHe1GroupName, AacHe2GroupName, dolbyGroupName];

    // Create Audio Media Playlist for each Audio Track
    for (let audio of audioConfigs) {

        // Create Audio Media Playlist
        let audioMediaInfo = await createAudioMediaPlaylist(encoding, hlsManifest,
            audio.muxing,
            audio.stream,
            `${audio.id}.m3u8`,
            audio.segPath,
            audio.groupId,
            audio.HlsName,
            audio.lang
        );
    }

    // Create Video Variant for each Audio Group
    for (let video of h264Variants) {
        for (let audioGroup of uniqueAudioGroups) {
            let videoStreamInfo = await createVideoStreamPlaylist(
                encoding,
                hlsManifest,
                video.muxing,
                video.videoStream,
                `video_${video.videoConfiguration.height}_${video.videoConfiguration.bitrate}.m3u8`,
                video.segPath,
                audioGroup
            )
        }
    }

    return hlsManifest;
}

async function createVideoStreamPlaylist(
    encoding: Encoding,
    manifest: HlsManifest,
    videoMuxing: Muxing,
    videoStream: Stream,
    uri: string,
    segmentPath: string,
    audioGroup: string
) {
    let streamInfo = new StreamInfo({
        uri: uri,
        encodingId: encoding.id,
        streamId: videoStream.id,
        muxingId: videoMuxing.id,
        audio: audioGroup,
        segmentPath: segmentPath
    });

    streamInfo = await bitmovinApi.encoding.manifests.hls.streams.create(manifest.id!, streamInfo);
    return streamInfo;
}

async function createAudioMediaPlaylist(
    encoding: Encoding,
    manifest: HlsManifest,
    audioMuxing: Muxing,
    audioStream: Stream,
    uri: string,
    audioSegmentsPath: string,
    audioGroup: string,
    name: string,
    language: string,

) {
    const audioMediaInfo = new AudioMediaInfo({
        name: name,
        uri: uri,
        groupId: audioGroup,
        encodingId: encoding.id,
        streamId: audioStream.id,
        muxingId: audioMuxing.id,
        language: language,
        autoselect: false,
        isDefault: false,
        forced: false,
        segmentPath: audioSegmentsPath,
    });

    await bitmovinApi.encoding.manifests.hls.media.audio.create(manifest.id!, audioMediaInfo);
}

async function createHlsMasterManifest(name: string, output: Output, outputPath: string): Promise<HlsManifest> {
    const hlsManifest = new HlsManifest({
        name: name,
        outputs: [buildEncodingOutput(output, outputPath)]
    });

    return bitmovinApi.encoding.manifests.hls.create(hlsManifest);
}

/**
 * Creates an Encoding object. This is the base object to configure your encoding.
 *
 * <p>API endpoint:
 * https://bitmovin.com/docs/encoding/api-reference/sections/encodings#/Encoding/PostEncodingEncodings
 *
 * @param name A name that will help you identify the encoding in our dashboard (required)
 * @param description A description of the encoding (optional)
 */
function createEncoding(name: string, description: string): Promise<Encoding> {
    const encoding = new Encoding({
        name: name,
        description: description
    });

    return bitmovinApi.encoding.encodings.create(encoding);
}

/**
 * Adds a video or audio stream to an encoding
 *
 * <p>API endpoint:
 * https://bitmovin.com/docs/encoding/api-reference/sections/encodings#/Encoding/PostEncodingEncodingsStreamsByEncodingId
 *
 * @param encoding The encoding to which the stream will be added
 * @param input The input resource providing the input file
 * @param inputPath The path to the input file
 * @param codecConfiguration The codec configuration to be applied to the stream
 */
function createStream(
    encoding: Encoding,
    input: Input,
    inputPath: string,
    codecConfiguration: CodecConfiguration
): Promise<Stream> {
    const streamInput = new StreamInput({
        inputId: input.id,
        inputPath: inputPath,
        selectionMode: StreamSelectionMode.AUTO
    });

    const stream = new Stream({
        inputStreams: [streamInput],
        codecConfigId: codecConfiguration.id
    });

    return bitmovinApi.encoding.encodings.streams.create(encoding.id!, stream);
}

/**
 * Creates a resource representing an HTTP server providing the input files. For alternative input
 * methods see <a
 * href="https://bitmovin.com/docs/encoding/articles/supported-input-output-storages">list of
 * supported input and output storages</a>
 *
 * <p>For reasons of simplicity, a new input resource is created on each execution of this
 * example. In production use, this method should be replaced by a <a
 * href="https://bitmovin.com/docs/encoding/api-reference/sections/inputs#/Encoding/GetEncodingInputsHttpByInputId">get
 * call</a> to retrieve an existing resource.
 *
 * <p>API endpoint:
 * https://bitmovin.com/docs/encoding/api-reference/sections/inputs#/Encoding/PostEncodingInputsHttp
 *
 * @param host The hostname or IP address of the HTTP server e.g.: my-storage.biz
 */
function createHttpInput(host: string): Promise<HttpInput> {
    const input = new HttpInput({
        host: host
    });

    return bitmovinApi.encoding.inputs.http.create(input);
}

/**
 * Creates a resource representing an AWS S3 cloud storage bucket to which generated content will
 * be transferred. For alternative output methods see <a
 * href="https://bitmovin.com/docs/encoding/articles/supported-input-output-storages">list of
 * supported input and output storages</a>
 *
 * <p>The provided credentials need to allow <i>read</i>, <i>write</i> and <i>list</i> operations.
 * <i>delete</i> should also be granted to allow overwriting of existings files. See <a
 * href="https://bitmovin.com/docs/encoding/faqs/how-do-i-create-a-aws-s3-bucket-which-can-be-used-as-output-location">creating
 * an S3 bucket and setting permissions</a> for further information
 *
 * <p>For reasons of simplicity, a new output resource is created on each execution of this
 * example. In production use, this method should be replaced by a <a
 * href="https://bitmovin.com/docs/encoding/api-reference/sections/outputs#/Encoding/GetEncodingOutputsS3">get
 * call</a> retrieving an existing resource.
 *
 * <p>API endpoint:
 * https://bitmovin.com/docs/encoding/api-reference/sections/outputs#/Encoding/PostEncodingOutputsS3
 *
 * @param bucketName The name of the S3 bucket
 * @param accessKey The access key of your S3 account
 * @param secretKey The secret key of your S3 account
 */
function createS3Output(bucketName: string, accessKey: string, secretKey: string): Promise<S3Output> {
    const s3Output = new S3Output({
        bucketName: bucketName,
        accessKey: accessKey,
        secretKey: secretKey
    });

    return bitmovinApi.encoding.outputs.s3.create(s3Output);
}


/**
 * Creates a configuration for the H.264 video codec to be applied to video streams.
 *
 * <p>The output resolution is defined by setting the height to 1080 pixels. Width will be
 * determined automatically to maintain the aspect ratio of your input video.
 *
 * <p>To keep things simple, we use a quality-optimized VoD preset configuration, which will apply
 * proven settings for the codec. See <a
 * href="https://bitmovin.com/docs/encoding/tutorials/how-to-optimize-your-h264-codec-configuration-for-different-use-cases">How
 * to optimize your H264 codec configuration for different use-cases</a> for alternative presets.
 *
 * <p>API endpoint:
 * https://bitmovin.com/docs/encoding/api-reference/sections/configurations#/Encoding/PostEncodingConfigurationsVideoH264
 *
 * @param width The width of the output video
 * @param height The height of the output video
 * @param bitrate The target bitrate of the output video
 */
function createH264VideoConfig(width: number, height: number, bitrate: number): Promise<H264VideoConfiguration> {
    const config = new H264VideoConfiguration({
        name: `H.264 ${height}p ${Math.round(bitrate / 1000)} Kbit/s`,
        presetConfiguration: PresetConfiguration.VOD_STANDARD,
        height: height,
        width: width,
        bitrate: bitrate
    });

    return bitmovinApi.encoding.configurations.video.h264.create(config);
}

/**
 * Creates a configuration for the AAC audio codec to be applied to audio streams.
 *
 * <p>API endpoint:
 * https://bitmovin.com/docs/encoding/api-reference/sections/configurations#/Encoding/PostEncodingConfigurationsAudioAac
 *
 * @param bitrate The target bitrate for the encoded audio
 */
function createAacAudioConfig(bitrate: number, channelLayout: AacChannelLayout): Promise<AacAudioConfiguration> {
    const config = new AacAudioConfiguration({
        name: `AAC-LC ${Math.round(bitrate / 1000)} kbit/s`,
        bitrate: bitrate,
        channelLayout: channelLayout
    });
    return bitmovinApi.encoding.configurations.audio.aac.create(config);
}

function createAacHE1Config(bitrate: number, channelLayout: AacChannelLayout): Promise<HeAacV1AudioConfiguration> {
    const config = new HeAacV1AudioConfiguration({
        name: `AAC-HE V1 ${Math.round(bitrate / 1000)} kbit/s`,
        bitrate: bitrate,
        channelLayout: channelLayout
    });
    return bitmovinApi.encoding.configurations.audio.heAacV1.create(config);
}

function createAacHE2Config(bitrate: number, channelLayout: AacChannelLayout): Promise<HeAacV2AudioConfiguration>{
    const config = new HeAacV2AudioConfiguration({
        name: `AAC-HE V2 ${Math.round(bitrate / 1000)} kbit/s`,
        bitrate: bitrate,
        channelLayout: channelLayout
    });

    return bitmovinApi.encoding.configurations.audio.heAacV2.create(config);
}

function createDolbyDigitalAudioConfig(): Promise<DolbyDigitalAudioConfiguration> {
    const config = new DolbyDigitalAudioConfiguration({
        name: 'Dolby Digital Channel Layout 5.1',
        bitrate: 256000,
        channelLayout: DolbyDigitalChannelLayout.CL_5_1
    });

    return bitmovinApi.encoding.configurations.audio.dolbyDigital.create(config);
}

/**
 * Creates a fragmented MP4 muxing. This will generate segments with a given segment length for
 * adaptive streaming.
 *
 * <p>API endpoint:
 * https://bitmovin.com/docs/encoding/api-reference/all#/Encoding/PostEncodingEncodingsMuxingsFmp4ByEncodingId
 *
 * @param encoding The encoding where to add the muxing to
 * @param output The output that should be used for the muxing to write the segments to
 * @param outputPath The output path where the fragmented segments will be written to
 * @param stream The stream that is associated with the muxing
 */
function createFmp4Muxing(encoding: Encoding, output: Output, outputPath: string, stream: Stream): Promise<Fmp4Muxing> {
    const muxing = new Fmp4Muxing({
        segmentLength: 4.0,
        outputs: [buildEncodingOutput(output, outputPath)],
        streams: [new MuxingStream({streamId: stream.id})]
    });

    return bitmovinApi.encoding.encodings.muxings.fmp4.create(encoding.id!, muxing);
}

/**
 * Builds an EncodingOutput object which defines where the output content (e.g. of a muxing) will
 * be written to. Public read permissions will be set for the files written, so they can be
 * accessed easily via HTTP.
 *
 * @param output The output resource to be used by the EncodingOutput
 * @param outputPath The path where the content will be written to
 */
function buildEncodingOutput(output: Output, outputPath: string): EncodingOutput {
    const aclEntry = new AclEntry({
        permission: AclPermission.PUBLIC_READ
    });

    return new EncodingOutput({
        outputPath: buildAbsolutePath(outputPath),
        outputId: output.id,
        acl: [aclEntry]
    });
}

/**
 * Builds an absolute path by concatenating the S3_OUTPUT_BASE_PATH configuration parameter, the
 * name of this example and the given relative path
 *
 * <p>e.g.: /s3/base/path/exampleName/relative/path
 *
 * @param relativePath The relative path that is concatenated
 * @return The absolute path
 */
function buildAbsolutePath(relativePath: string): string {
    return join(configProvider.getS3OutputBasePath(), exampleName, relativePath);
}

/**
 * Starts the actual encoding process and periodically polls its status until it reaches a final
 * state
 *
 * <p>API endpoints:
 * https://bitmovin.com/docs/encoding/api-reference/all#/Encoding/PostEncodingEncodingsStartByEncodingId
 * https://bitmovin.com/docs/encoding/api-reference/sections/encodings#/Encoding/GetEncodingEncodingsStatusByEncodingId
 *
 * <p>Please note that you can also use our webhooks API instead of polling the status. For more
 * information consult the API spec:
 * https://bitmovin.com/docs/encoding/api-reference/sections/notifications-webhooks
 *
 * @param encoding The encoding to be started
 * @param startEncodingRequest The request object to be sent with the start call
 */
async function executeEncoding(encoding: Encoding, startEncodingRequest: StartEncodingRequest): Promise<void> {
    await bitmovinApi.encoding.encodings.start(encoding.id!, startEncodingRequest);

    let task: Task;
    do {
        await timeout(5000);
        task = await bitmovinApi.encoding.encodings.status(encoding.id!);
        console.log(`Encoding status is ${task.status} (progress: ${task.progress} %)`);
    } while (task.status !== Status.FINISHED && task.status !== Status.ERROR);

    if (task.status === Status.ERROR) {
        logTaskErrors(task);
        throw new Error('Encoding failed');
    }

    console.log('Encoding finished successfully');
}

/**
 * Wraps a manifest ID into a ManifestResource object, so it can be referenced in one of the
 * StartEncodingRequest manifest lists.
 *
 * @param manifest The manifest to be generated at the end of the encoding process
 */
function buildManifestResource(manifest: Manifest) {
    return new ManifestResource({
        manifestId: manifest.id
    });
}

function logTaskErrors(task: Task): void {
    if (task.messages == undefined) {
        return;
    }
    task.messages!.filter(msg => msg.type === MessageType.ERROR).forEach(msg => console.error(msg.text));
}

function timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
