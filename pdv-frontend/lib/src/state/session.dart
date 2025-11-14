import 'package:flutter/material.dart';

class Session extends ChangeNotifier {
  int? userId;
  int? unitId;
  String? role;
  String? name;

  bool get isLogged => userId != null;

  void setUser(Map<String, dynamic> user) {
    userId = user['id'];
    unitId = user['unitId'];
    role = user['role'];
    name = user['name'];
    notifyListeners();
  }

  void logout() {
    userId = null;
    unitId = null;
    role = null;
    name = null;
    notifyListeners();
  }
}
