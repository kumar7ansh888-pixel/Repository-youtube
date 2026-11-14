import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_iframe/youtube_player_iframe.dart';

bool isYoutubeUrl(String url) =>
    YoutubePlayerController.convertUrlToId(url) != null;

bool isDirectVideoUrl(String url) {
  final path = Uri.tryParse(url)?.path.toLowerCase() ?? '';
  return path.endsWith('.mp4') ||
      path.endsWith('.m3u8') ||
      path.endsWith('.webm') ||
      path.endsWith('.mov');
}

/// Plays a YouTube lecture (unlisted videos work well) or a direct video
/// file / HLS stream (.mp4, .m3u8) from your own storage or a video host.
class VideoPlayerScreen extends StatelessWidget {
  const VideoPlayerScreen({super.key, required this.title, required this.url});
  final String title;
  final String url;

  @override
  Widget build(BuildContext context) {
    final youtubeId = YoutubePlayerController.convertUrlToId(url);
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        titleTextStyle: const TextStyle(
          fontFamily: 'Roboto',
          color: Colors.white,
          fontSize: 17,
          fontWeight: FontWeight.w700,
        ),
        title: Text(title, overflow: TextOverflow.ellipsis),
      ),
      body: SafeArea(
        child: url.trim().isEmpty
            ? const _NoVideo()
            : youtubeId != null
            ? _YoutubeLecture(videoId: youtubeId)
            : _FileLecture(url: url),
      ),
    );
  }
}

class _NoVideo extends StatelessWidget {
  const _NoVideo();
  @override
  Widget build(BuildContext context) => const Center(
    child: Text(
      'Video link is missing.',
      style: TextStyle(color: Colors.white70),
    ),
  );
}

class _YoutubeLecture extends StatefulWidget {
  const _YoutubeLecture({required this.videoId});
  final String videoId;

  @override
  State<_YoutubeLecture> createState() => _YoutubeLectureState();
}

class _YoutubeLectureState extends State<_YoutubeLecture> {
  late final YoutubePlayerController _controller =
      YoutubePlayerController.fromVideoId(
        videoId: widget.videoId,
        autoPlay: true,
        params: const YoutubePlayerParams(
          showFullscreenButton: true,
          strictRelatedVideos: true,
          showVideoAnnotations: false,
        ),
      );

  @override
  void dispose() {
    _controller.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      Center(child: YoutubePlayer(controller: _controller));
}

class _FileLecture extends StatefulWidget {
  const _FileLecture({required this.url});
  final String url;

  @override
  State<_FileLecture> createState() => _FileLectureState();
}

class _FileLectureState extends State<_FileLecture> {
  VideoPlayerController? _video;
  ChewieController? _chewie;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final uri = Uri.tryParse(widget.url);
    if (uri == null) {
      setState(() => _error = 'Invalid video link');
      return;
    }
    final video = VideoPlayerController.networkUrl(uri);
    _video = video;
    try {
      await video.initialize();
      if (!mounted) return;
      setState(() {
        _chewie = ChewieController(
          videoPlayerController: video,
          autoPlay: true,
          allowPlaybackSpeedChanging: true,
          playbackSpeeds: const [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
          aspectRatio: video.value.aspectRatio == 0
              ? 16 / 9
              : video.value.aspectRatio,
        );
      });
    } catch (e) {
      if (mounted) setState(() => _error = e);
    }
  }

  @override
  void dispose() {
    _chewie?.dispose();
    _video?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'This video could not be played. Please check your internet connection and try again.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70),
          ),
        ),
      );
    }
    final chewie = _chewie;
    if (chewie == null) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }
    return Center(child: Chewie(controller: chewie));
  }
}
