import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'src/services/api.dart';
import 'src/state/session.dart';
import 'src/screens/login_screen.dart';
import 'src/screens/home_screen.dart';

void main() {
  runApp(const SiriusPDV());
}

class SiriusPDV extends StatelessWidget {
  const SiriusPDV({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider(create: (_) => Api(baseUrl: const String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3333'))),
        ChangeNotifierProvider(create: (_) => Session()),
      ],
      child: MaterialApp(
        title: 'Sirius PDV',
        theme: ThemeData.dark(useMaterial3: true),
        routes: {
          '/': (_) => const LoginScreen(),
          '/home': (_) => const HomeScreen(),
        },
      ),
    );
  }
}
