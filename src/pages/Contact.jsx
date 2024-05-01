import styled from 'styled-components';
import Swal from 'sweetalert2';
import Breadcrumb from '../components/Breadcrumb';
import { useState } from 'react';
import Button from '../components/Button';
import emailjs from 'emailjs-com';

const ContactSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContactBox = styled.div`
  width: clamp(100px, 90%, 1000px);
  display: flex;
  flex-wrap: wrap;
`;

const StyledMap = styled.div`
  width: 50%;
  height: 500px;

  @media only screen and (max-width: 800px) {
    width: 100%;
    border-radius: 0 0 10px 10px;
  }
`

const ContactFormWrapper = styled.div`
  width: 50%;
  padding: 8% 5% 10% 5%;
  background-color: #fdf1e9;
  border-radius: 0 10px 10px 0;

  @media only screen and (max-width: 800px) {
    width: 100%;
    border-radius: 0 0 10px 10px;
  }
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormItem = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  outline: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 12px;
  font-size: clamp(15px, 1.5vw, 18px);
`;

const TextArea = styled.textarea`
  width: 100%;
  outline: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 12px;
  font-size: clamp(15px, 1.5vw, 18px);
`;

const sendMessage = async (form) => {
  try {
    // Use emailjs to send the message via email
    const templateParams = {
      name: form.name,
      email: form.email,
      message: form.message,
    };

    await emailjs.send(
      'service_vg2a0g3',
      'template_vd0rq39',
      templateParams,
      'uR-pWmuRecgQJO4mA'
    );

  } catch (error) {
    console.error('Error sending email:', error);
  }
};


const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(formData);

    Swal.fire({
      icon: 'success',
      title: 'Form Submitted!',
      text: 'Thank you for reaching out. We will get back to you soon.',
    });

    // Reset the form data
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };


  return (
    <>
      <Breadcrumb />
      <h1 className='text-center my-5 px-3'>Reach Out and Connect with Us</h1>
      <ContactSection id="contact">
        <ContactBox className="contact-box">
          <StyledMap>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.94433434224!2d77.93048882619614!3d10.362419072645277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00aa57a54881e3%3A0x765a14068982e6e7!2sDindigul%2C%20Tamil%20Nadu%20624001!5e0!3m2!1sen!2sin!4v1710768484146!5m2!1sen!2sin"width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen=""
        title="myapp"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"></iframe></StyledMap>
          <ContactFormWrapper className="contact-form-wrapper">
            <ContactForm onSubmit={handleFormSubmit}>
              <FormItem className="form-item">
                <Input
                  type="text"
                  name="sender"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  required
                />
              </FormItem>
              <FormItem className="form-item">
                <Input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  required
                />
              </FormItem>
              <FormItem className="form-item">
                <TextArea
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Message"
                  required
                />
              </FormItem>
              <Button type='submit'>Send</Button>
            </ContactForm>
          </ContactFormWrapper>
        </ContactBox>
      </ContactSection>
    </>
  );
};

export default Contact;
