import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api.dart';
import '../state/session.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;
  Map<String, dynamic>? _catalog;
  List<Map<String, dynamic>> _cart = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = Provider.of<Api>(context, listen: false);
    final cat = await api.catalog();
    setState(() {
      _catalog = cat;
    });
  }

  @override
  Widget build(BuildContext context) {
    final session = Provider.of<Session>(context);
    final api = Provider.of<Api>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('SIRIUS PDV'),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Center(child: Text(session.name ?? '')),
          )
        ],
      ),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _tab,
            onDestinationSelected: (i) => setState(() => _tab = i),
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(
                  icon: Icon(Icons.storefront), label: Text('BALCÃO')),
              NavigationRailDestination(
                  icon: Icon(Icons.table_bar), label: Text('MESAS')),
              NavigationRailDestination(
                  icon: Icon(Icons.restaurant), label: Text('COZINHA')),
              NavigationRailDestination(
                  icon: Icon(Icons.delivery_dining), label: Text('DELIVERY')),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(child: _buildTab())
        ],
      ),
      bottomNavigationBar: _tab == 0 ? _cartBar(context) : null,
    );
  }

  Widget _buildTab() {
    switch (_tab) {
      case 0:
        return _balcao();
      case 1:
        return _mesas();
      case 2:
        return _cozinha();
      case 3:
        return _delivery();
      default:
        return const SizedBox();
    }
  }

  Widget _balcao() {
    if (_catalog == null)
      return const Center(child: CircularProgressIndicator());
    final products = List<Map<String, dynamic>>.from(_catalog!['products']);
    final categories = List<Map<String, dynamic>>.from(_catalog!['categories']);
    return Row(
      children: [
        Expanded(
          flex: 3,
          child: GridView.count(
            crossAxisCount: 4,
            padding: const EdgeInsets.all(12),
            children: products.map((p) {
              return Card(
                child: InkWell(
                  onTap: () {
                    setState(() {
                      final idx = _cart.indexWhere((e) => e['id'] == p['id']);
                      if (idx == -1)
                        _cart.add({...p, 'quantity': 1});
                      else
                        _cart[idx]['quantity'] += 1;
                    });
                  },
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.fastfood, size: 40),
                      const SizedBox(height: 8),
                      Text(p['name'], textAlign: TextAlign.center),
                      const SizedBox(height: 4),
                      Text('R\$ ${(p['priceCents'] / 100).toStringAsFixed(2)}')
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const VerticalDivider(width: 1),
        Expanded(
          flex: 2,
          child: _cartPanel(),
        )
      ],
    );
  }

  Widget _cartPanel() {
    final total =
        _cart.fold<num>(0, (acc, e) => acc + e['priceCents'] * e['quantity']);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Padding(
          padding: EdgeInsets.all(8.0),
          child: Text('RESUMO PEDIDO',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _cart.length,
            itemBuilder: (_, i) {
              final it = _cart[i];
              return ListTile(
                title: Text('${it['name']} (x${it['quantity']})'),
                subtitle: Text(
                    'R\$ ${(it['priceCents'] * it['quantity'] / 100).toStringAsFixed(2)}'),
                trailing: IconButton(
                    icon: const Icon(Icons.delete),
                    onPressed: () {
                      setState(() {
                        _cart.removeAt(i);
                      });
                    }),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('VALOR: R\$ ${(total / 100).toStringAsFixed(2)}',
                  textAlign: TextAlign.right),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _cart.isEmpty
                    ? null
                    : () async {
                        final api = Provider.of<Api>(context, listen: false);
                        final payload = {
                          'channel': 'BALCAO',
                          'items': _cart
                              .map((e) => {
                                    'productId': e['id'],
                                    'quantity': e['quantity']
                                  })
                              .toList(),
                        };
                        final order = await api.createOrder(payload);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content:
                                      Text('Pedido enviado para a cozinha')));
                          setState(() {
                            _cart.clear();
                          });
                        }
                      },
                child: const Text('FECHAR PEDIDO'),
              )
            ],
          ),
        )
      ],
    );
  }

  Widget _cartBar(BuildContext ctx) {
    final total = _cart.fold<int>(
      0,
      (a, e) =>
          a +
          (int.parse(e['priceCents'].toString()) *
                  int.parse(e['quantity'].toString()))
              .round(),
    );

    return Container(
      color: Theme.of(ctx).colorScheme.surface,
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Text(
              'Itens: ${_cart.fold<int>(0, (a, e) => a + (e['quantity'] as int))}'),
          const Spacer(),
          Text('Total: R\$ ${(total / 100).toStringAsFixed(2)}'),
        ],
      ),
    );
  }

  Widget _mesas() {
    return FutureBuilder<List<dynamic>>(
      future: Provider.of<Api>(context).tables(),
      builder: (context, snapshot) {
        if (!snapshot.hasData)
          return const Center(child: CircularProgressIndicator());
        final tables = snapshot.data!;
        return GridView.count(
          crossAxisCount: 4,
          padding: const EdgeInsets.all(12),
          children: tables.map((t) {
            return Card(
              child: InkWell(
                onTap: () {},
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('MESA ${t['number']}',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('Status: ${t['status']}'),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _cozinha() {
    return FutureBuilder<List<dynamic>>(
      future: Provider.of<Api>(context).orders(status: 'PENDING'),
      builder: (context, snapshot) {
        if (!snapshot.hasData)
          return const Center(child: CircularProgressIndicator());
        final orders = snapshot.data!;
        return GridView.count(
          crossAxisCount: 3,
          padding: const EdgeInsets.all(12),
          children: orders.map((o) {
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('PEDIDO #${o['id']}',
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Expanded(
                        child: ListView(
                      children:
                          List<Map<String, dynamic>>.from(o['items']).map((it) {
                        return Text(
                            '• ${it['product']['name']} (x${it['quantity']})');
                      }).toList(),
                    )),
                    const SizedBox(height: 8),
                    FilledButton(
                      onPressed: () async {
                        await Provider.of<Api>(context, listen: false)
                            .updateOrderStatus(o['id'], 'IN_KITCHEN');
                        setState(() {});
                      },
                      child: const Text('FINALIZAR'),
                    )
                  ],
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _delivery() {
    return FutureBuilder<List<dynamic>>(
      future: Provider.of<Api>(context).orders(),
      builder: (context, snapshot) {
        if (!snapshot.hasData)
          return const Center(child: CircularProgressIndicator());
        final orders = snapshot.data!;
        return ListView.builder(
          itemCount: orders.length,
          itemBuilder: (_, i) {
            final o = orders[i];
            return ListTile(
              title: Text('Pedido #${o['id']} • ${o['status']}'),
              subtitle: Text('${o['items'].length} itens'),
            );
          },
        );
      },
    );
  }
}
