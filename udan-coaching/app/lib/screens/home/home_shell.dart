import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../models/models.dart';
import '../../widgets/common.dart';
import 'home_tab.dart';
import 'my_batches_tab.dart';
import 'profile_tab.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.profile});
  final StudentProfile profile;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          if (backend.isDemo)
            SafeArea(bottom: false, child: const DemoBanner()),
          Expanded(
            child: MediaQuery.removePadding(
              context: context,
              removeTop: backend.isDemo,
              child: IndexedStack(
                index: _index,
                children: [
                  HomeTab(
                    profile: widget.profile,
                    onOpenMyBatches: () => setState(() => _index = 1),
                  ),
                  const MyBatchesTab(),
                  ProfileTab(profile: widget.profile),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book_rounded),
            label: 'My Batches',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
