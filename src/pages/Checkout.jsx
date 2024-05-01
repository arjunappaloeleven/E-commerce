import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { generateUUID, currentDate } from '../utils/helpers';
import axios from 'axios';
import styled from 'styled-components';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../components/Breadcrumb';

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { userID, isAuthenticated } = useContext(AuthContext);

  const [shippingAddress, setShippingAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderID, setOrderID] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('amana');
  const navigate = useNavigate();

  // redirect to login if the user is not Authenticated
  useEffect(() => {
    if (!isAuthenticated || cart.items.lenght == 0) {
      navigate('/cart')
    }
  }, [isAuthenticated, cart]);

  const createOrder = async () => {
    try {
      if (cart.items.length === 0) {
        throw new Error('No items in the cart. Please fill your cart to make an order.');
      }

      const orderId = generateUUID();
      const deliveryOption = deliveryOptions[selectedDeliveryOption];

      const order = {
        id: orderId,
        user_id: userID,
        shipping_address: shippingAddress,
        name: name,
        phone: phone,
        order_status: 'pending',
        created_at: currentDate(),
        description: `order n° ${orderId}`,
        order_total: totalOrder,
        delivery_company: selectedDeliveryOption === 'amana' ? 'Amana' : 'Ozone',
        delivery_coast: deliveryOption.cost,
        items: cart.items.map((item) => ({
          id: item.id,
          image: item.image,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          quantity_stock: item.quantity_stock,
          subTotal: item.price * item.quantity,
        })),
      };  

      const response = await axios.post('http://localhost:3000/orders', order);
      return response.data.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // update product quantity in stock
  const updateProductStock = async () => {
    try {
      for (const item of cart.items) {
        const updatedStock = parseInt(item.quantity_stock) - parseInt(item.quantity);
        await axios.patch(`http://localhost:3000/products/${item.id}`, { quantity_stock: updatedStock });
        console.log(updatedStock)
        console.log(item.id)
        console.log(item.quantity)
        console.log(item.quantity_stock)
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  };

  const handleOrderPlace = async () => {
    try {
      const orderId = await createOrder();
      await updateProductStock();
      clearCart();
      setOrderID(orderId);
      setSuccess(true);

      Swal.fire({
        icon: 'success',
        title: 'Order placed successfully!',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOrderDelivered = async () => {
    try {
      await axios.patch(`http://localhost:3000/orders/${orderID}`, { order_status: 'delivered' });
      Swal.fire({
        icon: 'success',
        title: 'Order marked as delivered!',
        showConfirmButton: false,
        timer: 2000,
      });
      navigate('/products');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deliveryOptions = {
    amana: { label: 'Delivery by Amana 24h', cost: 30.0 },
    ozone: { label: 'Delivery by Ozone 48h', cost: 20.0 },
  };
  
  const subTotal = cart.items.reduce((total, item) => total + item.subTotal, 0);
  const totalOrder = subTotal + deliveryOptions[selectedDeliveryOption].cost;
  const [amount, setamount] = useState('');

  const handlep = (e)=>{
    
  }

  return (
    <div className='container px-4 '>
      <Breadcrumb />
      <Title>Checkout</Title>
      <div className="row">
        {success ? (
          <div className="col-md-12">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
              <h4 className="alert-heading">Order placed successfully!</h4>
              <p>You&apos;ll receive your order soon. Once you have received it, please click on the button &quot;I received my order&quot; to confirm the delivery.</p>
              <small className="text-danger">Order n° {orderID}</small>
              <hr />
              <p className="mb-0">Thank you for choosing our service!</p>
            </div>
            <Button handleClick={handleOrderDelivered}>I received my order</Button>
          </div>
        ) : (
          <>
            <div className="col-md-6 mt-5">
              <form className='mt-5'>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number :</label>
                  <input
                    type="number"
                    className="form-control"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="shippingAddress" className="form-label">Shipping Address :</label>
                  <input
                    type="text"
                    className="form-control"
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>
                </form>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h2 className="card-title text-center mb-4">Your Order</h2>
                  <div className="d-flex justify-content-between">
                    <p className="card-text fw-bold">Product</p>
                    <span className='fw-bold'>Sub-Total</span>
                  </div>
                  <hr />
                  {cart.items.map((item) => (
                    <div key={item.title} className="d-flex justify-content-between mb-2">
                      <p className="card-text">{item.title} <small>({item.quantity})</small></p>
                      <span>Rs.{item.subTotal.toFixed(2)} </span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <p className="card-text fw-bold">Order Sub-Total : </p>
                    <span className='text-success'>Rs.{subTotal.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <p className="card-text fw-bold">Order Total : </p>
                    <span className='text-danger'>Rs.{totalOrder.toFixed(2)} </span>
                  </div>
                  <p className="card-text">Delivered By : {selectedDeliveryOption === 'amana' ? 'Amana' : 'Ozone'}</p>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="deliveryAmana"
                      value="amana"
                      checked={selectedDeliveryOption === 'amana'}
                      onChange={() => setSelectedDeliveryOption('amana')}
                    />
                    <label className="form-check-label" htmlFor="deliveryAmana">Delivery by Amana 24h: 30.00 DH</label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="deliveryOzone"
                      value="ozone"
                      checked={selectedDeliveryOption === 'ozone'}
                      onChange={() => setSelectedDeliveryOption('ozone')}
                    />
                    <label className="form-check-label" htmlFor="deliveryOzone">Delivery by Ozone 48h: 20.00 DH</label>
                  </div>
                </div>
                <div className="card-footer text-center">
                  <Button className="my-3 px-4" handleClick={handleOrderPlace}>
                    Place Order
                  </Button>  <Button className="my-3 px-4" handleClick={handlep}>
                    Pay Now
                  </Button>
                  <img src="https://lh3.googleusercontent.com/pw/AP1GczPx4Y7O3OYAC6WvLZXTAvtQXXPoCB15uL1mXoqLgGm-uyyLMbi4z661Tc3fbLEbX5Mbqfti-o30nu7w3726vXv_i_g8Tn7RBYbK3gWHfRS_Ak-A81AgNbtexZQc76gBeezGDu6tdzw5vDR7zEs0-L6nJbO38w9xEH49pNxkxkPt6XKQh2Ye0STQ-TGqsMkDWjnsUgbxXdIHgd60jllNIVSQXkeHnrTsBT3L6DHJQemUZvwq4kCK-WJfrVPVoJqXv08drjsuqNADn17g6hIX__pYO88zbDl_EtmNneTa-B5CjY3M3ihqZgbb2zAoC_rn3VXI_j36H3aqOpvrNVCMW6PNRyiHA4XhuLMEcnpnDSwiRLm6GrlHOQ9sFRFurUUM7WLogEZX8Cam1pyf2WU1e1W5SaPE1L-PgVny9YF1YQNNv3kB10Wj5-1vA9ZIC8WLvSG-x2op6NtaLnqv0hmxWqLXMsHPD1AqQNXZaFvd0o-BfRXgCTxNoOJmqaGUKlFd8wbqa5kGNwyzkDYzQaLXH3BubovRG1xD5iCW_Jb7W5hCpVy6K7F1BnTRxNtt-ZFFAW8OzWMmr_4GkNNFVXxbkcrpeJ-GnJoirJO3vs-K43BNRX3uczCFF39qSXFkAtFYs8yjy5PYy3zA1T35xIxDaNRkxxEPAlzQ8rA-KbRHkPsVwcZCcrQhYNfe6BdzFK3ZH98CkWz4C6fhpyLKqJBFrn7ZfWBR1oLev869HiqYfKjNxN57LsOzaBsgMIguQ_n4f51kmFlP028_QgbBvGd9ggl7EN1N5BC9zKIqqDg10JIAJu4BF_sEvKnrMHnD02Ifu_RQsplH3DFAO3IA7IGtDjzidMgoPm_HyqvE2g-QLD4KbpfS3Yr-fnkUT-hQXlO_ucj4I3Odr6Jrim97=w936-h929-s-no-gm?authuser=0" alt="4x4 Image" style={{ width: '12rem', height: '12rem' }} />
                
                  
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
