'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchAllOrdersWithDetails,
  updateOrderStatus,
  createSalesRecord,
} from '@/api/management/axios';
import { OrderManagement, OrderStatusEnum } from '@/app/types/types';
import StatusManagement from './StatusManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { OrderLineImage } from '@/components/Order/OrderLineImage';

type SaleFinalizedStatus = 'none' | 'finalized' | 'exists' | 'failed';

const orderStatusLabels: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.CREATED]: 'Kreirano',
  [OrderStatusEnum.PENDING]: 'Na čekanju',
  [OrderStatusEnum.SHIPPED]: 'Poslato',
  [OrderStatusEnum.DELIVERED]: 'Dostavljeno',
  [OrderStatusEnum.CANCELLED]: 'Otkazano',
};

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<OrderManagement[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderManagement[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [searchOrderName, setSearchOrderName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [saleFinalizedStatusMap, setSaleFinalizedStatusMap] = useState<{
    [orderId: number]: SaleFinalizedStatus;
  }>({});

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const ordersData = await fetchAllOrdersWithDetails();
        const sortedOrders = ordersData.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);

        const initialStatusMap: { [orderId: number]: SaleFinalizedStatus } = {};
        sortedOrders.forEach((order) => {
          initialStatusMap[order.id] = 'none';
        });
        setSaleFinalizedStatusMap(initialStatusMap);

        setError(null);
      } catch (err) {
        setError('Učitavanje porudžbina nije uspjelo. Pokušajte ponovo.');
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrdersData();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatusEnum) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      setFilteredOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      setError(null);
      toast.success('Status porudžbine je uspješno ažuriran');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Ažuriranje statusa porudžbine nije uspjelo');
    }
  };

  const handleFinalizeSale = async (order: OrderManagement) => {
    try {
      const salesRecordData = {
        user_id: order.user_id,
        order_id: order.id,
        date_of_sale: new Date().toISOString(),
        buyer_name: order.user ? order.user.full_name : 'N/A',
        price: order.total_price,
      };

      const result = await createSalesRecord(salesRecordData);

      if (result === null) {
        toast.warning('A sales record for this order already exists.');
        setSaleFinalizedStatusMap((prev) => ({
          ...prev,
          [order.id]: 'exists',
        }));
      } else {
        toast.success('Prodaja je uspješno finalizovana!');
        setSaleFinalizedStatusMap((prev) => ({
          ...prev,
          [order.id]: 'finalized',
        }));
      }
    } catch (err) {
      console.error('Error finalizing sale:', err);
      toast.error('Finalizacija prodaje nije uspjela');
      setSaleFinalizedStatusMap((prev) => ({
        ...prev,
        [order.id]: 'failed',
      }));
    }
  };

  const applyFilters = () => {
    let updatedFilteredOrders = [...orders];
    if (startDate) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => new Date(order.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => new Date(order.created_at) <= new Date(endDate)
      );
    }
    if (statusFilter !== 'all') {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => order.status === statusFilter
      );
    }
    if (searchOrderId) {
      updatedFilteredOrders = updatedFilteredOrders.filter(
        (order) => order.id.toString() === searchOrderId.trim()
      );
    }
    if (searchOrderName) {
      updatedFilteredOrders = updatedFilteredOrders.filter((order) =>
        order.user?.full_name.toLowerCase().includes(searchOrderName.toLowerCase().trim())
      );
    }
    setFilteredOrders(updatedFilteredOrders);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewOrderClick = (orderId: number) => {
    window.location.href = `/order/${orderId}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Upravljanje porudžbinama</h2>
        <p className="text-muted-foreground">
          Pregled porudžbina, statusa isporuke i finalizacije prodaje iz jednog mjesta.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filteri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="startDate">Datum od</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Datum do</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sve" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve</SelectItem>
                  {Object.values(OrderStatusEnum).map((status) => (
                    <SelectItem key={status} value={status}>
                      {orderStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">ID porudžbine</Label>
              <Input
                id="orderId"
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Pretraga po ID porudžbine"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderName">Ime kupca</Label>
              <Input
                id="orderName"
                type="text"
                value={searchOrderName}
                onChange={(e) => setSearchOrderName(e.target.value)}
                placeholder="Pretraga po imenu"
              />
            </div>
          </div>
          <Button onClick={applyFilters}>Primijeni filtere</Button>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nema porudžbina koje odgovaraju filterima.</p>
            </CardContent>
          </Card>
        ) : (
          currentOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <CardTitle className="text-xl">Porudžbina #{order.id}</CardTitle>
                  <StatusManagement
                    orderId={order.id}
                    currentStatus={order.status}
                    onStatusChange={handleStatusChange}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="font-medium">
                      Korisnik:{' '}
                      <span className="font-normal">
                        {order.user ? `${order.user.full_name} (${order.user.email})` : 'N/A'}
                      </span>
                    </p>
                    <p className="font-medium">
                      Adresa:{' '}
                      <span className="font-normal">
                        {order.address
                          ? `${order.address.street_address}, ${order.address.city}, ${order.address.country}`
                          : 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">
                      Datum porudžbine:{' '}
                      <span className="font-normal">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="font-medium">
                      Ukupan iznos:{' '}
                      <span className="font-normal">€{order.total_price.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-lg font-medium">Artikli:</h4>
                  <ul className="mt-2 space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"
                      >
                        <OrderLineImage
                          src={item.product_image_url ?? item.product?.image_url}
                          alt={item.product_name}
                          size="sm"
                        />
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-muted-foreground">
                            {item.quantity} × €{item.price.toFixed(2)}
                          </span>
                          <span
                            className="h-5 w-5 rounded-full border"
                            style={{ backgroundColor: item.color || '#FFFFFF' }}
                            title={item.color || 'N/A'}
                          />
                          <span className="text-muted-foreground">{item.size || 'N/A'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Finalized sale status badge */}
                <div className="mt-4">
                  {saleFinalizedStatusMap[order.id] === 'finalized' && (
                    <Badge>Prodaja finalizovana</Badge>
                  )}
                  {saleFinalizedStatusMap[order.id] === 'exists' && (
                    <Badge variant="secondary">Prodaja već postoji</Badge>
                  )}
                  {saleFinalizedStatusMap[order.id] === 'failed' && (
                    <Badge variant="destructive">Finalizacija nije uspjela</Badge>
                  )}
                </div>

                <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                  <Button onClick={() => handleFinalizeSale(order)} className="w-full md:w-auto">
                    Finalizuj prodaju
                  </Button>
                  <Button
                    onClick={() => handleViewOrderClick(order.id)}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    Pogledaj cijelu porudžbinu
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredOrders.length > itemsPerPage && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex -space-x-px">
            <Button
              variant="outline"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-l-lg rounded-r-none"
            >
              Prethodna
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? 'default' : 'outline'}
                onClick={() => paginate(number)}
                className="rounded-none"
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-l-none rounded-r-lg"
            >
              Sljedeća
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
