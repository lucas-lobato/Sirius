import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api.dart';
import '../state/session.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _codeCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  bool _obscurePassword = true; // 👈 NOVO

  @override
  Widget build(BuildContext context) {
    final api = Provider.of<Api>(context);
    final session = Provider.of<Session>(context, listen: false);

    return Scaffold(
      body: Row(
        children: [
          // === LADO ESQUERDO (LOGO) ===
          Expanded(
            flex: 2,
            child: Container(
              color: const Color(0xFF0E1A25),
              child: Center(
                child: Image.asset(
                  'assets/logo_sirius.png',
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                ),
              ),
            ),
          ),

          // === LADO DIREITO (LOGIN) ===
          Expanded(
            flex: 1,
            child: Container(
              color: const Color(0xFFF5EAD1),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 320),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'PDV',
                        style: TextStyle(
                          fontFamily: 'Orbitron',
                          fontWeight: FontWeight.w600,
                          fontSize: 28,
                          color: Colors.black87,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 40),

                      // === LOGIN ===
                      TextField(
                        controller: _codeCtrl,
                        style: const TextStyle(
                          color: Colors.black,
                          fontFamily: 'Poppins',
                        ),
                        cursorColor: Colors.black,
                        decoration: InputDecoration(
                          labelText: 'Login',
                          labelStyle: const TextStyle(
                            color: Colors.grey,
                            fontFamily: 'Poppins',
                          ),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 14,
                            horizontal: 16,
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // === SENHA COM BOTÃO DE OLHO ===
                      TextField(
                        controller: _passCtrl,
                        obscureText: _obscurePassword, // 👈 CONTROLADO
                        style: const TextStyle(
                          color: Colors.black,
                          fontFamily: 'Poppins',
                        ),
                        cursorColor: Colors.black,
                        decoration: InputDecoration(
                          labelText: 'Senha',
                          labelStyle: const TextStyle(
                            color: Colors.grey,
                            fontFamily: 'Poppins',
                          ),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6),
                            borderSide: BorderSide.none,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 14,
                            horizontal: 16,
                          ),

                          // 👇 ÍCONE DO OLHO AQUI
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off   // fechado
                                  : Icons.visibility,       // aberto
                              color: Colors.grey,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                        ),
                      ),

                      const SizedBox(height: 30),

                      if (_error != null)
                        Text(
                          _error!,
                          style: const TextStyle(
                            color: Colors.red,
                            fontFamily: 'Poppins',
                          ),
                        ),

                      // === BOTÃO LOGIN ===
                      SizedBox(
                        width: 130,
                        height: 44,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF37C91E),
                            elevation: 3,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          onPressed: _loading
                              ? null
                              : () async {
                                  setState(() {
                                    _loading = true;
                                    _error = null;
                                  });

                                  try {
                                    final res = await api.login(
                                      _codeCtrl.text.trim(),
                                      _passCtrl.text.trim(),
                                    );

                                    session.setUser(
                                        Map<String, dynamic>.from(res['user']));

                                    if (context.mounted) {
                                      Navigator.of(context)
                                          .pushReplacementNamed('/home');
                                    }
                                  } catch (e) {
                                    setState(() {
                                      _error = 'Falha no login';
                                    });
                                  } finally {
                                    setState(() {
                                      _loading = false;
                                    });
                                  }
                                },
                          child: _loading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text(
                                  'LOGIN',
                                  style: TextStyle(
                                    fontFamily: 'Orbitron',
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
