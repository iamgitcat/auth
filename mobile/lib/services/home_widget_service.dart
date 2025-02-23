import "dart:math";

import "package:flutter/material.dart";
import 'package:home_widget/home_widget.dart' as hw;
import "package:logging/logging.dart";
import "package:photos/core/configuration.dart";
import "package:photos/core/constants.dart";
import "package:photos/db/files_db.dart";
import "package:photos/models/file/file_type.dart";
import "package:photos/services/favorites_service.dart";
import "package:photos/utils/file_util.dart";
import "package:photos/utils/preload_util.dart";

class HomeWidgetService {
  final Logger _logger = Logger((HomeWidgetService).toString());

  HomeWidgetService._privateConstructor();

  static final HomeWidgetService instance =
      HomeWidgetService._privateConstructor();

  Future<void> initHomeWidget() async {
    final isLoggedIn = Configuration.instance.isLoggedIn();

    if (!isLoggedIn) {
      await clearHomeWidget();
      _logger.info("user not logged in");
      return;
    }

    final collectionID =
        await FavoritesService.instance.getFavoriteCollectionID();
    if (collectionID == null) {
      await clearHomeWidget();
      _logger.info("Favorite collection not found");
      return;
    }

    try {
      await hw.HomeWidget.setAppGroupId(iOSGroupID);
      final res = await FilesDB.instance.getFilesInCollection(
        collectionID,
        galleryLoadStartTime,
        galleryLoadEndTime,
      );

      final previousGeneratedId =
          await hw.HomeWidget.getWidgetData<int>("home_widget_last_img");

      if (res.files.length == 1 &&
          res.files[0].generatedID == previousGeneratedId) {
        _logger
            .info("Only one image found and it's the same as the previous one");
        return;
      }
      if (res.files.isEmpty) {
        await clearHomeWidget();
        _logger.info("No images found");
        return;
      }
      final files = res.files.where(
        (element) =>
            element.generatedID != previousGeneratedId &&
            element.fileType == FileType.image,
      );

      final randomNumber = Random().nextInt(files.length);
      final randomFile = files.elementAt(randomNumber);
      final fullImage = await getFileFromServer(randomFile);
      if (fullImage == null) throw Exception("File not found");

      final image = await decodeImageFromList(await fullImage.readAsBytes());
      final width = image.width.toDouble();
      final height = image.height.toDouble();
      final size = min(min(width, height), 1024.0);
      final aspectRatio = width / height;
      late final int cacheWidth;
      late final int cacheHeight;
      if (aspectRatio > 1) {
        cacheWidth = 1024;
        cacheHeight = (1024 / aspectRatio).round();
      } else if (aspectRatio < 1) {
        cacheHeight = 1024;
        cacheWidth = (1024 * aspectRatio).round();
      } else {
        cacheWidth = 1024;
        cacheHeight = 1024;
      }
      final Image img = Image.file(
        fullImage,
        fit: BoxFit.cover,
        cacheWidth: cacheWidth,
        cacheHeight: cacheHeight,
      );

      await PreloadImage.loadImage(img.image);

      final widget = ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: Colors.black,
            image: DecorationImage(image: img.image, fit: BoxFit.cover),
          ),
        ),
      );

      await hw.HomeWidget.renderFlutterWidget(
        widget,
        logicalSize: Size(size, size),
        key: "slideshow",
      );

      if (randomFile.generatedID != null) {
        await hw.HomeWidget.saveWidgetData<int>(
          "home_widget_last_img",
          randomFile.generatedID!,
        );
      }

      await hw.HomeWidget.updateWidget(
        name: 'SlideshowWidgetProvider',
        androidName: 'SlideshowWidgetProvider',
        qualifiedAndroidName: 'io.ente.photos.SlideshowWidgetProvider',
        iOSName: 'SlideshowWidget',
      );
      _logger.info(
        ">>> OG size of SlideshowWidget image: ${width} x $height",
      );
      _logger.info(
        ">>> SlideshowWidget image rendered with size ${cacheWidth} x $cacheHeight",
      );
    } catch (e) {
      _logger.severe("Error rendering widget", e);
    }
  }

  Future<int> countHomeWidgets() async {
    return await hw.HomeWidget.getWidgetCount(
          name: 'SlideshowWidgetProvider',
          androidName: 'SlideshowWidgetProvider',
          qualifiedAndroidName: 'io.ente.photos.SlideshowWidgetProvider',
          iOSName: 'SlideshowWidget',
        ) ??
        0;
  }

  Future<void> clearHomeWidget() async {
    final previousGeneratedId =
        await hw.HomeWidget.getWidgetData<int>("home_widget_last_img");
    if (previousGeneratedId == null) return;

    _logger.info("Clearing SlideshowWidget");
    await hw.HomeWidget.saveWidgetData(
      "slideshow",
      null,
    );

    await hw.HomeWidget.updateWidget(
      name: 'SlideshowWidgetProvider',
      androidName: 'SlideshowWidgetProvider',
      qualifiedAndroidName: 'io.ente.photos.SlideshowWidgetProvider',
      iOSName: 'SlideshowWidget',
    );
    await hw.HomeWidget.saveWidgetData<int>(
      "home_widget_last_img",
      null,
    );
    _logger.info(">>> SlideshowWidget cleared");
  }
}
