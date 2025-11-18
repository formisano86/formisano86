'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { cartApi, ordersApi, paymentApi, carriersApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/utils/format';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Carrier } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'klarna'>('stripe');
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const sameAsBilling = watch('sameAsBilling', true);

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const { data } = await carriersApi.getAll();
        setCarriers(data);
        if (data.length > 0) setSelectedCarrier(data[0].id);
      } catch (error) {
        console.error('Error fetching carriers:', error);
      }
    };
    fetchCarriers();
  }, []);

  const calculateTotal = () => {
    const subtotal = total;
    const shipping = 5;
    const tax = subtotal * 0.22;
    const grandTotal = subtotal + shipping + tax - discount;
    return { subtotal, shipping, tax, grandTotal };
  };

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddressId: data.shippingAddress.id || 'temp',
        billingAddressId: data.sameAsBilling ? data.shippingAddress.id || 'temp' : data.billingAddress.id || 'temp',
        carrierId: selectedCarrier,
        discountCode,
      };

      const { data: order } = await ordersApi.create(orderData);

      // Process payment based on selected method
      if (paymentMethod === 'stripe') {
        await handleStripePayment(order.id);
      } else if (paymentMethod === 'paypal') {
        await handlePayPalPayment(order.id);
      } else if (paymentMethod === 'klarna') {
        await handleKlarnaPayment(order.id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Errore durante il checkout');
      setLoading(false);
    }
  };

  const handleStripePayment = async (orderId: string) => {
    if (!stripe || !elements) return;

    try {
      const { data } = await paymentApi.createStripeIntent({ orderId });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        await paymentApi.confirmStripe({ paymentIntentId: paymentIntent.id });
        clearCart();
        await cartApi.clear();
        toast.success('Pagamento completato!');
        router.push(`/orders/${orderId}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Errore nel pagamento');
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (orderId: string) => {
    // PayPal payment handled by PayPalButtons component
    toast.info('Completa il pagamento con PayPal');
  };

  const handleKlarnaPayment = async (orderId: string) => {
    try {
      const { data } = await paymentApi.createKlarnaSession({ orderId });
      toast.info('Reindirizzamento a Klarna...');
      // In a real implementation, redirect to Klarna checkout
    } catch (error) {
      toast.error('Errore con Klarna');
      setLoading(false);
    }
  };

  const { subtotal, shipping, tax, grandTotal } = calculateTotal();

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Indirizzo di Spedizione</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                {...register('shippingAddress.firstName', { required: true })}
                placeholder="Nome"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                {...register('shippingAddress.lastName', { required: true })}
                placeholder="Cognome"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                {...register('shippingAddress.address1', { required: true })}
                placeholder="Indirizzo"
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                {...register('shippingAddress.city', { required: true })}
                placeholder="Città"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                {...register('shippingAddress.postalCode', { required: true })}
                placeholder="CAP"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                {...register('shippingAddress.phone', { required: true })}
                placeholder="Telefono"
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                {...register('sameAsBilling')}
                defaultChecked
                className="mr-2"
              />
              <label>Indirizzo di fatturazione uguale alla spedizione</label>
            </div>

            {!sameAsBilling && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register('billingAddress.firstName', { required: !sameAsBilling })}
                  placeholder="Nome"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  {...register('billingAddress.lastName', { required: !sameAsBilling })}
                  placeholder="Cognome"
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Metodo di Spedizione</h2>
            <div className="space-y-2">
              {carriers.map((carrier) => (
                <label key={carrier.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value={carrier.id}
                    checked={selectedCarrier === carrier.id}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{carrier.name}</p>
                    <p className="text-sm text-gray-600">
                      Consegna in {carrier.estimatedDays} giorni
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(carrier.shippingCost || 5)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Metodo di Pagamento</h2>

            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 py-3 rounded-lg font-semibold ${
                  paymentMethod === 'stripe'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Carta di Credito
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`flex-1 py-3 rounded-lg font-semibold ${
                  paymentMethod === 'paypal'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                PayPal
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('klarna')}
                className={`flex-1 py-3 rounded-lg font-semibold ${
                  paymentMethod === 'klarna'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Klarna
              </button>
            </div>

            {paymentMethod === 'stripe' && (
              <div className="p-4 border border-gray-300 rounded-lg">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': { color: '#aab7c4' },
                      },
                    },
                  }}
                />
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="text-center text-gray-600">
                Verrai reindirizzato a PayPal per completare il pagamento
              </div>
            )}

            {paymentMethod === 'klarna' && (
              <div className="text-center text-gray-600">
                Verrai reindirizzato a Klarna per completare il pagamento
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Riepilogo</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>
                    {formatCurrency((item.product.salePrice || item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotale</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Spedizione</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Sconto</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t pt-3">
                <span>Totale</span>
                <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Elaborazione...' : 'Completa Ordine'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
          currency: 'EUR',
        }}
      >
        <CheckoutForm />
      </PayPalScriptProvider>
    </Elements>
  );
}
