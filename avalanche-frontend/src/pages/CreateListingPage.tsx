import React, { useState } from 'react';
import { styled } from '../stitches.config';
import { Link, useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import API from '../services/api';

const PageContainer = styled('div', {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-primary)',
  padding: '$8 $4',
});

const FormContainer = styled('div', {
  maxWidth: '800px',
  margin: '0 auto',
});

const Title = styled('h1', {
  fontSize: '32px',
  fontWeight: '$bold',
  color: 'var(--text-primary)',
  marginBottom: '$2',
  textAlign: 'center',
});

const Subtitle = styled('p', {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  marginBottom: '$8',
  textAlign: 'center',
});

const FormCard = styled('div', {
  backgroundColor: 'var(--card-bg)',
  borderRadius: '12px',
  padding: '$8',
  border: '1px solid var(--border-color)',
});

const Section = styled('div', {
  marginBottom: '$8',
});

const SectionTitle = styled('h2', {
  fontSize: '16px',
  fontWeight: '$semibold',
  color: 'var(--text-primary)',
  marginBottom: '$4',
});

const FormGroup = styled('div', {
  marginBottom: '$5',
});

const Label = styled('label', {
  display: 'block',
  fontSize: '14px',
  fontWeight: '$medium',
  color: 'var(--text-primary)',
  marginBottom: '$2',
});

const Input = styled('input', {
  width: '100%',
  padding: '11px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--input-bg)',
  transition: 'all 0.2s',

  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-shadow)',
  },
});

const Textarea = styled('textarea', {
  width: '100%',
  padding: '11px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--input-bg)',
  minHeight: '120px',
  resize: 'vertical',
  transition: 'all 0.2s',
  fontFamily: 'inherit',

  '&::placeholder': {
    color: 'var(--text-tertiary)',
  },

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-shadow)',
  },
});

const Select = styled('select', {
  width: '100%',
  padding: '11px 14px',
  fontSize: '14px',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  backgroundColor: 'var(--input-bg)',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:focus': {
    outline: 'none',
    borderColor: 'var(--primary-color)',
    boxShadow: '0 0 0 3px var(--primary-shadow)',
  },
});

const FlexRow = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '$4',
});

const UploadBox = styled('div', {
  border: '2px dashed var(--border-color)',
  borderRadius: '12px',
  padding: '$8',
  textAlign: 'center',
  backgroundColor: 'var(--bg-secondary)',
  cursor: 'pointer',
  transition: 'all 0.2s',

  '&:hover': {
    borderColor: 'var(--primary-color)',
    backgroundColor: 'var(--bg-tertiary)',
  },
});

const UploadIcon = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '$3',
  color: 'var(--text-secondary)',
});

const UploadText = styled('p', {
  fontSize: '14px',
  color: 'var(--text-secondary)',
  marginBottom: '$1',
});

const UploadHint = styled('p', {
  fontSize: '12px',
  color: 'var(--text-tertiary)',
});

const ImagePreview = styled('div', {
  display: 'flex',
  gap: '$4',
  marginTop: '$4',
  flexWrap: 'wrap',
});

const PreviewImage = styled('div', {
  position: 'relative',
  width: '100px',
  height: '100px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',

  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

const RemoveButton = styled('button', {
  position: 'absolute',
  top: '4px',
  right: '4px',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: 'rgba(239, 68, 68, 0.9)',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 'bold',

  '&:hover': {
    backgroundColor: '#dc2626',
  },
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '$4',
  justifyContent: 'flex-end',
  marginTop: '$8',
});

const Button = styled('button', {
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '$medium',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: 'none',

  variants: {
    variant: {
      secondary: {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',

        '&:hover': {
          backgroundColor: 'var(--bg-secondary)',
        },
      },
      primary: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',

        '&:hover': {
          backgroundColor: 'var(--primary-hover)',
        },

        '&:disabled': {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          cursor: 'not-allowed',
        },
      },
    },
  },
});

const ErrorText = styled('div', {
  fontSize: '12px',
  color: '#dc2626',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const SuccessText = styled('div', {
  fontSize: '12px',
  color: '#059669',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [hasPaymentInfo, setHasPaymentInfo] = useState(false);
  const [checkingPaymentInfo, setCheckingPaymentInfo] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '1',
    condition: '',
  });
  const [paymentData, setPaymentData] = useState({
    payment_method: 'card',
    card_holder_name: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    routing_number: '',
  });
  const [validationErrors, setValidationErrors] = useState({
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    routing_number: '',
    account_number: '',
  });

  // Check if user has payment info on mount
  React.useEffect(() => {
    const checkPaymentInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/seller/payment-info', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`
          }
        });

        if (response.ok) {
          setHasPaymentInfo(true);
        }
      } catch (error) {
        console.log('No payment info found');
      } finally {
        setCheckingPaymentInfo(false);
      }
    };

    checkPaymentInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    // Add space every 4 digits
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digitsOnly.length >= 2) {
      return digitsOnly.substring(0, 2) + '/' + digitsOnly.substring(2, 4);
    }
    return digitsOnly;
  };

  const validateCardNumber = (cardNumber: string): boolean => {
    // Luhn algorithm for card validation
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const validateExpiryDate = (expiry: string): boolean => {
    if (!expiry || expiry.length !== 5) return false;

    const [month, year] = expiry.split('/');
    const monthNum = parseInt(month);
    const yearNum = parseInt('20' + year);

    if (monthNum < 1 || monthNum > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  };

  const validateCVV = (cvv: string, cardNumber: string): boolean => {
    const digits = cvv.replace(/\D/g, '');
    const cardDigits = cardNumber.replace(/\D/g, '');

    // Amex uses 4 digits, others use 3
    const isAmex = cardDigits.startsWith('34') || cardDigits.startsWith('37');
    const expectedLength = isAmex ? 4 : 3;

    return digits.length === expectedLength;
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    const newErrors = { ...validationErrors };

    // Format card number
    if (name === 'card_number') {
      newValue = formatCardNumber(value);
      const digits = newValue.replace(/\D/g, '');
      if (digits.length >= 13) {
        if (!validateCardNumber(newValue)) {
          newErrors.card_number = 'Invalid card number';
        } else {
          newErrors.card_number = '';
        }
      } else {
        newErrors.card_number = '';
      }
      setValidationErrors(newErrors);
      setPaymentData(prev => ({ ...prev, [name]: newValue }));
      return;
    }

    // Format expiry date
    if (name === 'card_expiry') {
      newValue = formatExpiryDate(value);
      if (newValue.length === 5) {
        if (!validateExpiryDate(newValue)) {
          newErrors.card_expiry = 'Invalid or expired date';
        } else {
          newErrors.card_expiry = '';
        }
      } else {
        newErrors.card_expiry = '';
      }
      setValidationErrors(newErrors);
      setPaymentData(prev => ({ ...prev, [name]: newValue }));
      return;
    }

    // Format CVV (digits only)
    if (name === 'card_cvv') {
      const digitsOnly = value.replace(/\D/g, '');
      newValue = digitsOnly.substring(0, 4);
      if (newValue.length >= 3) {
        if (!validateCVV(newValue, paymentData.card_number)) {
          newErrors.card_cvv = 'Invalid CVV';
        } else {
          newErrors.card_cvv = '';
        }
      } else {
        newErrors.card_cvv = '';
      }
      setValidationErrors(newErrors);
      setPaymentData(prev => ({ ...prev, [name]: newValue }));
      return;
    }

    // Format account number (digits only)
    if (name === 'account_number') {
      const digitsOnly = value.replace(/\D/g, '');
      newValue = digitsOnly;
      if (digitsOnly.length > 0) {
        if (digitsOnly.length < 8 || digitsOnly.length > 17) {
          newErrors.account_number = 'Must be 8-17 digits';
        } else {
          newErrors.account_number = '';
        }
      } else {
        newErrors.account_number = '';
      }
      setValidationErrors(newErrors);
      setPaymentData(prev => ({ ...prev, [name]: newValue }));
      return;
    }

    // Format routing number (digits only, max 9)
    if (name === 'routing_number') {
      const digitsOnly = value.replace(/\D/g, '');
      newValue = digitsOnly.substring(0, 9);
      if (digitsOnly.length > 0 && digitsOnly.length !== 9) {
        newErrors.routing_number = 'Must be exactly 9 digits';
      } else {
        newErrors.routing_number = '';
      }
      setValidationErrors(newErrors);
      setPaymentData(prev => ({ ...prev, [name]: newValue }));
      return;
    }

    setPaymentData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Add new images
    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if payment info is required
    if (!hasPaymentInfo) {
      // Validate payment info
      if (paymentData.payment_method === 'card') {
        if (!paymentData.card_holder_name || !paymentData.card_number) {
          alert('Please provide your card details to receive payments');
          return;
        }

        // Validate card number using Luhn algorithm
        if (!validateCardNumber(paymentData.card_number)) {
          alert('Invalid card number. Please check and try again.');
          return;
        }

        // Validate expiry date
        if (!paymentData.card_expiry || !validateExpiryDate(paymentData.card_expiry)) {
          alert('Invalid or expired card. Please provide a valid expiry date (MM/YY).');
          return;
        }

        // Validate CVV
        if (!paymentData.card_cvv || !validateCVV(paymentData.card_cvv, paymentData.card_number)) {
          alert('Invalid CVV. Please provide a valid CVV code.');
          return;
        }
      } else if (paymentData.payment_method === 'bank_account') {
        if (!paymentData.account_holder_name || !paymentData.account_number) {
          alert('Please provide your bank account details to receive payments');
          return;
        }

        // Validate routing number (US banks - 9 digits)
        if (paymentData.routing_number && paymentData.routing_number.length !== 9) {
          alert('Routing number must be 9 digits');
          return;
        }

        // Validate account number (typically 8-17 digits)
        const accountDigits = paymentData.account_number.replace(/\D/g, '');
        if (accountDigits.length < 8 || accountDigits.length > 17) {
          alert('Invalid account number. Account number should be 8-17 digits.');
          return;
        }
      }
    }

    try {
      setLoading(true);

      // Save payment info first if not already saved
      if (!hasPaymentInfo) {
        try {
          const paymentResponse = await fetch('http://localhost:8000/seller/payment-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('avalanche_token')}`
            },
            body: JSON.stringify(paymentData)
          });

          if (!paymentResponse.ok) {
            const error = await paymentResponse.json();
            throw new Error(error.detail || 'Failed to save payment information');
          }

          setHasPaymentInfo(true);
        } catch (paymentError) {
          console.error('Failed to save payment info:', paymentError);
          alert(`Failed to save payment information: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }

      // Create product
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category || undefined,
        stock: parseInt(formData.stock) || 1,
      };

      const createdProduct = await API.products.create(productData);

      // Upload image if exists
      if (images.length > 0) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', images[0]); // Upload first image

        try {
          await API.products.update(createdProduct.id, formDataWithImage);
        } catch (imgError) {
          console.error('Failed to upload image:', imgError);
          // Continue anyway - product is created
        }
      }

      alert('Product listed successfully! Payments will be automatically sent to your registered account when buyers confirm delivery.');
      navigate('/marketplace');
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage as draft
    localStorage.setItem('marketplace_draft', JSON.stringify({ ...formData, images: imagePreviews }));
    alert('Draft saved!');
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>Create a New Listing</Title>
        <Subtitle>Fill in the details below to publish your item to the marketplace.</Subtitle>

        <FormCard>
          <Section>
            <SectionTitle>Core Details</SectionTitle>
            
            <FormGroup>
              <Label>Product Name</Label>
              <Input
                type="text"
                name="name"
                placeholder="e.g., Handcrafted Leather Wallet"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Detailed Description</Label>
              <Textarea
                name="description"
                placeholder="Describe your item in detail, including features, materials, and any unique aspects."
                value={formData.description}
                onChange={handleInputChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Category</Label>
              <Select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Garden</option>
                <option value="sports">Sports & Outdoors</option>
                <option value="books">Books & Media</option>
                <option value="toys">Toys & Games</option>
                <option value="art">Art & Crafts</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Listing Specifics</SectionTitle>
            
            <FlexRow>
              <FormGroup>
                <Label>Price</Label>
                <Input
                  type="number"
                  name="price"
                  placeholder="$ 0.00"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  name="stock"
                  placeholder="1"
                  min="1"
                  value={formData.stock}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FlexRow>

            <FormGroup>
              <Label>Condition</Label>
              <Select name="condition" value={formData.condition} onChange={handleInputChange}>
                <option value="">Select a condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="for-parts">For Parts</option>
              </Select>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Product Images</SectionTitle>

            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <label htmlFor="image-upload">
              <UploadBox as="div">
                <UploadIcon>
                  <Upload size={40} />
                </UploadIcon>
                <UploadText>Click to upload or drag and drop</UploadText>
                <UploadHint>SVG, PNG, JPG or GIF (MAX. 800x400px)</UploadHint>
              </UploadBox>
            </label>

            {imagePreviews.length > 0 && (
              <ImagePreview>
                {imagePreviews.map((preview, index) => (
                  <PreviewImage key={index}>
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <RemoveButton onClick={() => handleRemoveImage(index)}>×</RemoveButton>
                  </PreviewImage>
                ))}
              </ImagePreview>
            )}
          </Section>

          {!hasPaymentInfo && !checkingPaymentInfo && (
            <Section style={{ borderTop: '2px solid #e5e7eb', paddingTop: '32px' }}>
              <SectionTitle>Payment Information (Required)</SectionTitle>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                To receive payments automatically when buyers confirm delivery, please provide your payment details.
              </p>

              <FormGroup>
                <Label>Payment Method</Label>
                <Select
                  name="payment_method"
                  value={paymentData.payment_method}
                  onChange={handlePaymentInputChange}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_account">Bank Account</option>
                </Select>
              </FormGroup>

              {paymentData.payment_method === 'card' && (
                <>
                  <FormGroup>
                    <Label>Card Holder Name</Label>
                    <Input
                      type="text"
                      name="card_holder_name"
                      placeholder="John Doe"
                      value={paymentData.card_holder_name}
                      onChange={handlePaymentInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Card Number</Label>
                    <Input
                      type="text"
                      name="card_number"
                      placeholder="4111 1111 1111 1111"
                      maxLength={19}
                      value={paymentData.card_number}
                      onChange={handlePaymentInputChange}
                      style={{
                        borderColor: validationErrors.card_number ? '#dc2626' : paymentData.card_number && !validationErrors.card_number && validateCardNumber(paymentData.card_number) ? '#059669' : undefined
                      }}
                    />
                    {validationErrors.card_number && (
                      <ErrorText>⚠ {validationErrors.card_number}</ErrorText>
                    )}
                    {!validationErrors.card_number && paymentData.card_number && validateCardNumber(paymentData.card_number) && (
                      <SuccessText>✓ Valid card number</SuccessText>
                    )}
                  </FormGroup>

                  <FlexRow>
                    <FormGroup>
                      <Label>Expiry Date</Label>
                      <Input
                        type="text"
                        name="card_expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={paymentData.card_expiry}
                        onChange={handlePaymentInputChange}
                        style={{
                          borderColor: validationErrors.card_expiry ? '#dc2626' : paymentData.card_expiry.length === 5 && !validationErrors.card_expiry ? '#059669' : undefined
                        }}
                      />
                      {validationErrors.card_expiry && (
                        <ErrorText>⚠ {validationErrors.card_expiry}</ErrorText>
                      )}
                      {!validationErrors.card_expiry && paymentData.card_expiry.length === 5 && (
                        <SuccessText>✓ Valid</SuccessText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>CVV</Label>
                      <Input
                        type="text"
                        name="card_cvv"
                        placeholder="123"
                        maxLength={4}
                        value={paymentData.card_cvv}
                        onChange={handlePaymentInputChange}
                        style={{
                          borderColor: validationErrors.card_cvv ? '#dc2626' : paymentData.card_cvv.length >= 3 && !validationErrors.card_cvv ? '#059669' : undefined
                        }}
                      />
                      {validationErrors.card_cvv && (
                        <ErrorText>⚠ {validationErrors.card_cvv}</ErrorText>
                      )}
                      {!validationErrors.card_cvv && paymentData.card_cvv.length >= 3 && validateCVV(paymentData.card_cvv, paymentData.card_number) && (
                        <SuccessText>✓ Valid</SuccessText>
                      )}
                    </FormGroup>
                  </FlexRow>
                </>
              )}

              {paymentData.payment_method === 'bank_account' && (
                <>
                  <FormGroup>
                    <Label>Account Holder Name</Label>
                    <Input
                      type="text"
                      name="account_holder_name"
                      placeholder="John Doe"
                      value={paymentData.account_holder_name}
                      onChange={handlePaymentInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Bank Name</Label>
                    <Input
                      type="text"
                      name="bank_name"
                      placeholder="Bank of America"
                      value={paymentData.bank_name}
                      onChange={handlePaymentInputChange}
                    />
                  </FormGroup>

                  <FlexRow>
                    <FormGroup>
                      <Label>Account Number</Label>
                      <Input
                        type="text"
                        name="account_number"
                        placeholder="1234567890"
                        value={paymentData.account_number}
                        onChange={handlePaymentInputChange}
                        style={{
                          borderColor: validationErrors.account_number ? '#dc2626' : paymentData.account_number && !validationErrors.account_number ? '#059669' : undefined
                        }}
                      />
                      {validationErrors.account_number && (
                        <ErrorText>⚠ {validationErrors.account_number}</ErrorText>
                      )}
                      {!validationErrors.account_number && paymentData.account_number.length >= 8 && (
                        <SuccessText>✓ Valid</SuccessText>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>Routing Number</Label>
                      <Input
                        type="text"
                        name="routing_number"
                        placeholder="021000021"
                        value={paymentData.routing_number}
                        onChange={handlePaymentInputChange}
                        style={{
                          borderColor: validationErrors.routing_number ? '#dc2626' : paymentData.routing_number.length === 9 ? '#059669' : undefined
                        }}
                      />
                      {validationErrors.routing_number && (
                        <ErrorText>⚠ {validationErrors.routing_number}</ErrorText>
                      )}
                      {!validationErrors.routing_number && paymentData.routing_number.length === 9 && (
                        <SuccessText>✓ Valid</SuccessText>
                      )}
                    </FormGroup>
                  </FlexRow>
                </>
              )}

              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '16px'
              }}>
                <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                  🔒 Your payment information is encrypted and secure. Payments will be automatically transferred to this account when buyers confirm delivery.
                </p>
              </div>
            </Section>
          )}

          {hasPaymentInfo && (
            <Section style={{ borderTop: '2px solid #e5e7eb', paddingTop: '32px' }}>
              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '24px' }}>✓</div>
                <div>
                  <p style={{ fontSize: '14px', color: '#065f46', margin: 0, fontWeight: '600' }}>
                    Payment information saved
                  </p>
                  <p style={{ fontSize: '13px', color: '#047857', margin: '4px 0 0 0' }}>
                    Payments will be automatically sent to your registered account when buyers confirm delivery.
                  </p>
                </div>
              </div>
            </Section>
          )}

          <ButtonGroup>
            <Button variant="secondary" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Listing'}
            </Button>
          </ButtonGroup>
        </FormCard>
      </FormContainer>
    </PageContainer>
  );
};

export default CreateListingPage;
