import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:pdfx/pdfx.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../utils/format.dart';
import '../../widgets/common.dart';

/// Opens PDF notes inside the app. Works with direct PDF links and with
/// Google Drive "Anyone with the link" share links.
class PdfViewerScreen extends StatefulWidget {
  const PdfViewerScreen({super.key, required this.title, required this.url});
  final String title;
  final String url;

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  PdfControllerPinch? _controller;
  Object? _error;
  int _page = 1;
  int _pages = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _error = null;
      _controller = null;
    });
    try {
      final response = await http.get(Uri.parse(directPdfUrl(widget.url)));
      final bytes = response.bodyBytes;
      final looksLikePdf =
          bytes.length > 4 &&
          bytes[0] == 0x25 && // %
          bytes[1] == 0x50 && // P
          bytes[2] == 0x44 && // D
          bytes[3] == 0x46; // F
      if (response.statusCode != 200 || !looksLikePdf) {
        throw StateError('not a pdf (${response.statusCode})');
      }
      if (!mounted) return;
      setState(
        () => _controller = PdfControllerPinch(
          document: PdfDocument.openData(bytes),
        ),
      );
    } catch (e) {
      if (mounted) setState(() => _error = e);
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, overflow: TextOverflow.ellipsis),
        actions: [
          if (_pages > 0)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Text(
                  '$_page / $_pages',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ),
        ],
      ),
      body: _error != null
          ? MessageView(
              icon: Icons.picture_as_pdf_outlined,
              title: 'Could not open these notes',
              message: 'Check your internet connection. If it keeps failing, the PDF link may be wrong.',
              action: Wrap(
                spacing: 12,
                children: [
                  FilledButton(
                    onPressed: _load,
                    child: const Text('Try again'),
                  ),
                  OutlinedButton(
                    onPressed: () => launchUrl(
                      Uri.parse(widget.url),
                      mode: LaunchMode.externalApplication,
                    ),
                    child: const Text('Open outside'),
                  ),
                ],
              ),
            )
          : controller == null
          ? const LoadingView()
          : PdfViewPinch(
              controller: controller,
              onDocumentLoaded: (doc) =>
                  setState(() => _pages = doc.pagesCount),
              onPageChanged: (p) => setState(() => _page = p),
            ),
    );
  }
}
