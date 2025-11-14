import 'package:dio/dio.dart';

class Api {
  final String baseUrl;
  String? _token;
  late final Dio _dio;

  Api({required this.baseUrl}) {
    _dio = Dio(BaseOptions(baseUrl: baseUrl));
  }

  set token(String? t) {
    _token = t;
    _dio.options.headers['Authorization'] = t != null ? 'Bearer $t' : null;
  }

  Future<Map<String, dynamic>> login(String code, String password) async {
    final res = await _dio.post('/auth/login', data: { 'code': code, 'password': password });
    token = res.data['token'];
    return Map<String, dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> catalog({int unitId = 1}) async {
    final res = await _dio.get('/catalog', queryParameters: { 'unitId': unitId });
    return Map<String, dynamic>.from(res.data);
  }

  Future<List<dynamic>> tables() async {
    final res = await _dio.get('/tables');
    return List<dynamic>.from(res.data);
  }

  Future<List<dynamic>> orders({String? status}) async {
    final res = await _dio.get('/orders', queryParameters: { if (status != null) 'status': status });
    return List<dynamic>.from(res.data);
  }

  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> payload) async {
    final res = await _dio.post('/orders', data: payload);
    return Map<String, dynamic>.from(res.data);
  }

  Future<void> updateOrderStatus(int id, String status) async {
    await _dio.patch('/orders/$id/status', data: { 'status': status });
  }
}
