import 'package:flutter/material.dart';
import 'package:vector_math/vector_math_64.dart'
    hide Colors; // Import for Vector3, hiding the conflicting Colors class

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Classroom Seat Selector',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.deepPurple,
          foregroundColor: Colors.white,
        ),
      ),
      home: const ClassroomBenchesScreen(),
    );
  }
}

class ClassroomBenchesScreen extends StatefulWidget {
  const ClassroomBenchesScreen({super.key});

  @override
  State<ClassroomBenchesScreen> createState() => _ClassroomBenchesScreenState();
}

class _ClassroomBenchesScreenState extends State<ClassroomBenchesScreen>
    with SingleTickerProviderStateMixin {
  // Add mixin for animation
  // Hardcoded values as requested
  static const int seatPerBench = 3;
  static const List<int> seatStructure = [7, 0, 6, 0, 6, 0, 6, 0, 6, 0, 7];

  // A variable to store the currently selected seat (only one at a time)
  String? _selectedSeat;

  // Controller for managing zoom and pan transformations
  late final TransformationController _transformationController;
  // Controller for smooth animations
  late final AnimationController _animationController;
  Animation<Matrix4>? _animation;

  // Store calculated classroom dimensions
  double _classroomWidth = 0;
  double _classroomHeight = 0;

  final GlobalKey _interactiveViewerKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _transformationController = TransformationController();
    _animationController =
        AnimationController(
          vsync: this,
          duration: const Duration(milliseconds: 300), // Animation duration
        )..addListener(() {
          if (_animation != null) {
            _transformationController.value = _animation!.value;
          }
        });

    // Calculate dimensions immediately based on the seat structure
    _calculateClassroomDimensions();

    // Fit to screen after the first frame is rendered
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_classroomWidth > 0 && _classroomHeight > 0) {
        _fitToScreen();
      }
    });
  }

  @override
  void dispose() {
    _transformationController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  // Calculate and store the pixel dimensions of the classroom layout
  void _calculateClassroomDimensions() {
    double totalWidth = 0;
    // Calculate width based on actual widget sizes
    for (int benchesInColumn in seatStructure) {
      if (benchesInColumn == 0) {
        totalWidth += 30.0; // Aisle width
      } else {
        // Each seat is 40 wide + 4 horizontal margin (2 left, 2 right) = 44
        totalWidth += (seatPerBench * 44.0);
      }
    }

    // Calculate height - find the maximum number of benches in any column
    int maxBenches = 0;
    for (int benchesInColumn in seatStructure) {
      if (benchesInColumn > maxBenches) {
        maxBenches = benchesInColumn;
      }
    }
    // Each bench: seat height (35) + vertical margin (4) + vertical padding (8) = 47
    final totalHeight = (maxBenches * 47.0);

    setState(() {
      _classroomWidth = totalWidth;
      _classroomHeight = totalHeight;
    });
  }

  // Animate the view to fit the classroom on screen
  void _fitToScreen() {
    if (_classroomWidth == 0 || _interactiveViewerKey.currentContext == null) {
      return;
    }

    final RenderBox renderBox =
        _interactiveViewerKey.currentContext!.findRenderObject() as RenderBox;
    final viewSize = renderBox.size;

    final availableWidth = viewSize.width;

    // Calculate the optimal scale to fit the width
    final optimalScale = (availableWidth / _classroomWidth).clamp(0.1, 2.0);

    // Create a matrix that scales and centers the content.
    final scaledWidth = _classroomWidth * optimalScale;
    final translateX = (availableWidth - scaledWidth) / 2;

    final targetMatrix = Matrix4.identity()
      ..translateByVector3(Vector3(translateX, 0.0, 0.0)) // Center horizontally
      ..scaleByVector3(
        Vector3(optimalScale, optimalScale, 1.0),
      ); // Apply uniform scale

    // Animate from the current view to the new "fit-to-screen" view
    _animation =
        Matrix4Tween(
          begin: _transformationController.value,
          end: targetMatrix,
        ).animate(
          CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
        );
    _animationController.forward(from: 0.0);
  }

  // Toggles the selection state of a seat (only one seat at a time)
  void _toggleSeatSelection(String seatId) {
    setState(() {
      if (_selectedSeat == seatId) {
        _selectedSeat = null; // Deselect if tapped again
      } else {
        _selectedSeat = seatId; // Select the new seat
      }
    });
  }

  // After a gesture, this ensures the content doesn't go too far off-screen
  void _onInteractionEnd(ScaleEndDetails details) {
    if (_interactiveViewerKey.currentContext == null || _classroomWidth == 0) {
      return;
    }
    Matrix4 matrix = _transformationController.value.clone();

    final double currentScale = matrix.storage[0];

    final RenderBox renderBox =
        _interactiveViewerKey.currentContext!.findRenderObject() as RenderBox;
    final viewSize = renderBox.size;
    final availableWidth = viewSize.width;
    final availableHeight = viewSize.height;
    final optimalScale = (availableWidth / _classroomWidth);

    // If zoomed out too much, fit to screen
    if (currentScale < optimalScale) {
      _fitToScreen();
      return;
    }

    Vector3 translation = matrix.getTranslation();

    final scaledWidth = _classroomWidth * currentScale;
    final scaledHeight = _classroomHeight * currentScale;

    // Define edge margins
    const double edgeMargin = 20.0;

    // Calculate boundaries for horizontal scrolling
    double minTx, maxTx;
    if (scaledWidth <= availableWidth) {
      // Content fits within viewport - center it
      minTx = maxTx = (availableWidth - scaledWidth) / 2;
    } else {
      // Content is larger than viewport - allow scrolling with margins
      // Right edge: content's right edge should not go beyond screen width - margin
      maxTx = edgeMargin;
      // Left edge: content's left edge should not go beyond margin
      minTx = availableWidth - scaledWidth - edgeMargin;
    }

    // Calculate boundaries for vertical scrolling
    double minTy, maxTy;
    if (scaledHeight <= availableHeight) {
      // Content fits within viewport - center it vertically
      minTy = maxTy = (availableHeight - scaledHeight) / 2;
    } else {
      // Content is larger than viewport - allow scrolling with margins
      // Bottom edge: content's bottom should not go beyond screen height - margin
      maxTy = edgeMargin;
      // Top edge: content's top should not go beyond margin
      minTy = availableHeight - scaledHeight - edgeMargin;
    }

    // Clamp the translation to keep the content within bounds
    final double clampedTx = translation.x.clamp(minTx, maxTx);
    final double clampedTy = translation.y.clamp(minTy, maxTy);

    final Vector3 clampedTranslation = Vector3(clampedTx, clampedTy, 0);

    // Only animate if the translation needs to be corrected
    if ((translation.x - clampedTx).abs() > 0.1 ||
        (translation.y - clampedTy).abs() > 0.1) {
      matrix.setTranslation(clampedTranslation);
      _animation =
          Matrix4Tween(
            begin: _transformationController.value,
            end: matrix,
          ).animate(
            CurvedAnimation(
              parent: _animationController,
              curve: Curves.easeOut,
            ),
          );
      _animationController.forward(from: 0.0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Your Seat'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.zoom_out_map),
            tooltip: 'Fit to Screen',
            onPressed: _fitToScreen,
          ),
        ],
      ),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              "CLASSROOM SCREEN",
              style: TextStyle(
                color: Colors.deepPurple,
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 4,
              ),
            ),
          ),
          Container(
            width: MediaQuery.of(context).size.width * 0.7,
            height: 5,
            decoration: BoxDecoration(
              color: Colors.deepPurple,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: Colors.deepPurple.withAlpha(128),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: ClipRect(
              child: InteractiveViewer(
                key: _interactiveViewerKey,
                transformationController: _transformationController,
                constrained: false,
                boundaryMargin: const EdgeInsets.all(double.infinity),
                minScale: 0.1,
                maxScale: 4.0,
                onInteractionStart: (_) => _animationController.stop(),
                onInteractionEnd: _onInteractionEnd,
                // The child is now centered and its size is determined after the first layout pass
                child: _classroomWidth > 0
                    ? Center(child: _buildSeatLayout())
                    : const Center(child: CircularProgressIndicator()),
              ),
            ),
          ),
          _buildLegend(),
          _buildSummary(),
        ],
      ),
    );
  }

  // This is the core function that builds the entire seat layout widget
  Widget _buildSeatLayout() {
    // Build the classroom layout as a Row of columns
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: List.generate(seatStructure.length, (colIndex) {
        final int benchesInColumn = seatStructure[colIndex];
        if (benchesInColumn == 0) {
          return const SizedBox(width: 30.0); // Aisle
        }
        return _buildColumnOfBenches(colIndex, benchesInColumn, seatPerBench);
      }),
    );
  }

  // Builds a single vertical column of benches
  Widget _buildColumnOfBenches(
    int colIndex,
    int numBenches,
    int seatsPerBench,
  ) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(numBenches, (benchIndex) {
        return _buildBench(colIndex, benchIndex, seatsPerBench);
      }),
    );
  }

  // Builds a single horizontal bench (a Row of seats)
  Widget _buildBench(int colIndex, int benchIndex, int seatsPerBench) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(seatsPerBench, (seatIndex) {
          final rowLetter = String.fromCharCode(65 + benchIndex);
          int seatNumber = 1;
          for (int i = 0; i < colIndex; i++) {
            if (seatStructure[i] > benchIndex) {
              seatNumber += seatsPerBench;
            }
          }
          seatNumber += seatIndex;
          final seatId = '$rowLetter${seatNumber.toString().padLeft(2, '0')}';
          final isSelected = _selectedSeat == seatId;
          return _buildSeatItem(seatId, isSelected);
        }),
      ),
    );
  }

  // Builds the individual, tappable seat widget
  Widget _buildSeatItem(String seatId, bool isSelected) {
    return GestureDetector(
      onTap: () => _toggleSeatSelection(seatId),
      child: Container(
        margin: const EdgeInsets.all(2.0),
        width: 40.0,
        height: 35.0,
        decoration: BoxDecoration(
          color: isSelected ? Colors.deepPurple : Colors.grey.shade200,
          border: Border.all(
            color: isSelected
                ? Colors.deepPurple.shade300
                : Colors.grey.shade400,
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(6.0),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.deepPurple.withAlpha(128),
                    blurRadius: 5,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.event_seat,
              color: isSelected ? Colors.white : Colors.grey.shade600,
              size: 14.0,
            ),
            Text(
              seatId,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey.shade700,
                fontSize: 8.0,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Builds the legend to show seat status colors
  Widget _buildLegend() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildLegendItem(Colors.grey.shade200, "Available"),
          _buildLegendItem(Colors.deepPurple, "Selected"),
          _buildLegendItem(Colors.red.shade400, "Occupied"),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String text) {
    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: Colors.grey.shade300),
          ),
        ),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(color: Colors.black87, fontSize: 14)),
      ],
    );
  }

  // Builds the summary bar at the bottom
  Widget _buildSummary() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        border: Border(top: BorderSide(color: Colors.grey.shade300)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              _selectedSeat == null
                  ? 'No seat selected'
                  : 'Selected seat: $_selectedSeat',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.deepPurple,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 4,
            ),
            onPressed: _selectedSeat == null
                ? null
                : () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Confirmed seat selection: $_selectedSeat',
                        ),
                        backgroundColor: Colors.green,
                      ),
                    );
                  },
            child: const Text('CONFIRM', style: TextStyle(fontSize: 16)),
          ),
        ],
      ),
    );
  }
}
