import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Snackbar
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Person,
  Numbers,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components - FIXED: Added shouldForwardProp to prevent isDragActive DOM warning
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadArea = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragActive'
})(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const BillForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Refs
  const isMounted = useRef(true);
  const submittingRef = useRef(false);
  const safetyTimeoutRef = useRef(null);
  const hasMounted = useRef(false);
  const hasReachedUploadRef = useRef(false);
  const submitButtonRef = useRef(null);
  
  // NEW: Refs to prevent automatic submission
  const hasSubmittedAutomatically = useRef(false);
  const isStep3Render = useRef(false);
  const navigationLockRef = useRef(false);

  const [formData, setFormData] = useState({
    accountNumber: '',
    consumerName: '',
    billMonth: '',
    totalAmountDue: '',
    address: '',
    billNumber: '',
    dueDate: '',
    mobileNumber: '',
    email: '',
    meterNumber: '',
    unitsConsumed: ''
  });

  const steps = ['Bill Details', 'Consumer Info', 'Upload & Review'];

  // Debug activeStep changes
  useEffect(() => {
    console.log('🔵 Active step changed to:', activeStep);
    console.log('🔵 hasReachedUploadRef:', hasReachedUploadRef.current);
    console.log('🔵 Current form data:', formData);
    
    // If we just reached step 2, log it
    if (activeStep === 2) {
      console.log('🔵 REACHED UPLOAD STAGE - hasReachedUploadRef:', hasReachedUploadRef.current);
    }
  }, [activeStep, formData]);

  // Debug loading changes
  useEffect(() => {
    console.log('🟡 Loading state changed to:', loading);
  }, [loading]);

  // Cleanup on unmount
  useEffect(() => {
    hasMounted.current = true;
    console.log('🟢 Component mounted');
    
    return () => {
      console.log('🔴 Component unmounting');
      isMounted.current = false;
      hasReachedUploadRef.current = false;
      hasSubmittedAutomatically.current = false;
      isStep3Render.current = false;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleNext = () => {
    console.log('➡️ handleNext called, current step:', activeStep);
    setError('');
    
    if (activeStep === 0) {
      if (!formData.accountNumber?.trim()) {
        setError('Account Number is required');
        return;
      }
      if (!formData.billMonth?.trim()) {
        setError('Bill Month is required');
        return;
      }
      if (!formData.totalAmountDue) {
        setError('Total Amount Due is required');
        return;
      }
      if (parseFloat(formData.totalAmountDue) <= 0) {
        setError('Total Amount Due must be greater than 0');
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!formData.consumerName?.trim()) {
        setError('Consumer Name is required');
        return;
      }
      // Mark that we've reached the upload stage
      console.log('✅ Setting hasReachedUploadRef to TRUE');
      hasReachedUploadRef.current = true;
    }
    
    // CRITICAL: Set a flag when we're navigating TO step 3
    if (activeStep === 1) {
      isStep3Render.current = true;
      console.log('🚩 Setting isStep3Render flag to TRUE - about to enter step 3');
      
      // Clear this flag after a short delay to allow normal submissions
      setTimeout(() => {
        isStep3Render.current = false;
        console.log('🚩 isStep3Render flag reset to FALSE');
      }, 500);
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    console.log('⬅️ handleBack called, current step:', activeStep);
    setActiveStep((prev) => prev - 1);
    setError('');
    // Reset upload stage flag when going back
    if (activeStep === 2) {
      console.log('❌ Resetting hasReachedUploadRef to FALSE');
      hasReachedUploadRef.current = false;
    }
  };

  const resetForm = () => {
    console.log('🔄 Resetting form');
    setFormData({
      accountNumber: '',
      consumerName: '',
      billMonth: '',
      totalAmountDue: '',
      address: '',
      billNumber: '',
      dueDate: '',
      mobileNumber: '',
      email: '',
      meterNumber: '',
      unitsConsumed: ''
    });
    setFile(null);
    setPreview(null);
    setActiveStep(0);
    hasReachedUploadRef.current = false;
    hasSubmittedAutomatically.current = false;
    isStep3Render.current = false;
  };

  const handleSubmit = async (e) => {
    // CRITICAL: Immediately check if this is an automatic submission on step render
    if (isStep3Render.current) {
      console.log('🚫🚫🚫 BLOCKED automatic submission on step 3 render');
      e.preventDefault();
      return;
    }
    
    // Check if we've already submitted automatically
    if (hasSubmittedAutomatically.current) {
      console.log('🚫 Already submitted automatically, blocking');
      e.preventDefault();
      return;
    }
    
    console.log('🔴 HANDLE SUBMIT CALLED', new Date().toISOString());
    console.log('🔴 Event type:', e.type);
    console.log('🔴 hasMounted.current:', hasMounted.current);
    console.log('🔴 hasReachedUploadRef.current:', hasReachedUploadRef.current);
    console.log('🔴 loading:', loading);
    console.log('🔴 submittingRef.current:', submittingRef.current);
    console.log('🔴 Current active step:', activeStep);
    console.log('🔴 isStep3Render:', isStep3Render.current);
    
    e.preventDefault();
    
    // Log the event details
    console.log('🔴 Native event:', e.nativeEvent);
    console.log('🔴 Submitter:', e.nativeEvent?.submitter);
    console.log('🔴 Submitter text:', e.nativeEvent?.submitter?.textContent);
    console.log('🔴 Submitter disabled:', e.nativeEvent?.submitter?.disabled);
    
    // IMPORTANT: Prevent automatic submission on mount
    if (!hasMounted.current) {
      console.log('🔴 Preventing submission on mount');
      return;
    }
    
    // Don't allow submission if we haven't properly reached upload stage
    if (!hasReachedUploadRef.current) {
      console.log('🔴 Preventing submission - upload stage not properly reached');
      return;
    }
    
    // CRITICAL: Check if this is a real user interaction with a button
    if (!e.nativeEvent || !e.nativeEvent.submitter) {
      console.log('🔴 Preventing automatic form submission - no submitter');
      hasSubmittedAutomatically.current = true;
      return;
    }
    
    // CRITICAL: Check if the button is disabled (automatic submissions often have disabled buttons)
    if (e.nativeEvent.submitter.disabled) {
      console.log('🔴 Preventing submission - button is disabled');
      hasSubmittedAutomatically.current = true;
      return;
    }
    
    // Verify the submitter is actually the Create Bill button and it's enabled
    const submitter = e.nativeEvent.submitter;
    if (!submitter || !submitter.textContent) {
      console.log('🔴 Preventing submission - invalid submitter');
      hasSubmittedAutomatically.current = true;
      return;
    }
    
    // Check if button text indicates it's in loading state
    if (submitter.textContent.includes('Creating')) {
      console.log('🔴 Preventing submission - button is in Creating state');
      hasSubmittedAutomatically.current = true;
      return;
    }
    
    // Check if button text is exactly "Create Bill" (not "Creating..." or "Created!")
    if (submitter.textContent !== 'Create Bill') {
      console.log('🔴 Preventing submission - button text is not "Create Bill"');
      hasSubmittedAutomatically.current = true;
      return;
    }
    
    // Prevent double submission
    if (loading || submittingRef.current) {
      console.log('🔴 Submission already in progress, preventing duplicate');
      return;
    }
    
    console.log('🔴 Form submitted by user - proceeding');
    
    submittingRef.current = true;
    setLoading(true);
    setError('');
    setSuccess(false);

    // Safety timeout - reset loading if stuck
    safetyTimeoutRef.current = setTimeout(() => {
      if (isMounted.current && loading) {
        console.log('🔴 Safety timeout triggered - resetting loading state');
        setLoading(false);
        submittingRef.current = false;
        setError('Request timed out. Please try again.');
      }
    }, 15000);

    try {
      // Validate required fields
      if (!formData.accountNumber?.trim() || !formData.consumerName?.trim() || 
          !formData.billMonth?.trim() || !formData.totalAmountDue) {
        throw new Error('Missing required fields');
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('billData', JSON.stringify({
        accountNumber: formData.accountNumber.trim(),
        consumerName: formData.consumerName.trim(),
        billMonth: formData.billMonth.trim(),
        totalAmountDue: parseFloat(formData.totalAmountDue),
        address: formData.address?.trim() || '',
        billNumber: formData.billNumber?.trim() || '',
        dueDate: formData.dueDate || '',
        mobileNumber: formData.mobileNumber?.trim() || '',
        email: formData.email?.trim() || '',
        meterNumber: formData.meterNumber?.trim() || '',
        unitsConsumed: formData.unitsConsumed ? parseFloat(formData.unitsConsumed) : undefined
      }));

      if (file) {
        formDataToSend.append('billImage', file);
      }

      console.log('🔴 Sending request to backend...');
      
      const response = await axios.post('http://localhost:5000/api/bills', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000
      });

      console.log('🔴 Response received:', response.data);
      
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }

      if (response.data.success && isMounted.current) {
        setSuccess(true);
        setOpenSnackbar(true);
        
        // IMMEDIATELY stop loading state
        setLoading(false);
        submittingRef.current = false;
        
        console.log('🔴 Success - loading set to false');
        
        // Reset form after 3 seconds
        setTimeout(() => {
          if (isMounted.current) {
            setOpenSnackbar(false);
            
            setTimeout(() => {
              if (isMounted.current) {
                setSuccess(false);
                resetForm();
                console.log('🔴 Form reset complete');
              }
            }, 300);
          }
        }, 3000);
      } else {
        if (isMounted.current) {
          setLoading(false);
          submittingRef.current = false;
          setError('Unexpected response from server');
        }
      }
    } catch (err) {
      console.error('🔴 Submission error:', err);
      
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      
      if (isMounted.current) {
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Please try again.');
        } else if (err.message === 'Network Error') {
          setError('Cannot connect to server. Make sure backend is running on port 5000');
        } else if (err.response) {
          setError(err.response.data?.message || `Server error: ${err.response.status}`);
        } else if (err.request) {
          setError('No response from server. Check if backend is running.');
        } else {
          setError(err.message || 'Error creating bill');
        }
        
        setSuccess(false);
        setLoading(false);
        submittingRef.current = false;
      }
    }
  };

  const handleManualReset = () => {
    console.log('🟠 Manual reset triggered');
    setLoading(false);
    submittingRef.current = false;
    setError('Manually reset');
    hasSubmittedAutomatically.current = false;
    isStep3Render.current = false;
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Account Number *"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                variant="outlined"
                error={!formData.accountNumber && error.includes('Account')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Numbers color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Bill Number"
                name="billNumber"
                value={formData.billNumber}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Bill Month *"
                name="billMonth"
                value={formData.billMonth}
                onChange={handleChange}
                required
                placeholder="SEP-2023"
                variant="outlined"
                error={!formData.billMonth && error.includes('Month')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Due Date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Total Amount Due *"
                name="totalAmountDue"
                type="number"
                value={formData.totalAmountDue}
                onChange={handleChange}
                required
                variant="outlined"
                error={!formData.totalAmountDue && error.includes('Amount')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Units Consumed"
                name="unitsConsumed"
                type="number"
                value={formData.unitsConsumed}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Consumer Name *"
                name="consumerName"
                value={formData.consumerName}
                onChange={handleChange}
                required
                variant="outlined"
                error={!formData.consumerName && error.includes('Consumer')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Meter Number"
                name="meterNumber"
                value={formData.meterNumber}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <UploadArea
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                isDragActive={isDragActive}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {file ? file.name : 'Drag & drop or click to upload'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: JPG, PNG, GIF (Max 5MB)
                </Typography>
              </UploadArea>
            </Grid>
            
            {preview && (
              <Grid size={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview:
                </Typography>
                <Box
                  component="img"
                  src={preview}
                  alt="Bill preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </Grid>
            )}

            <Grid size={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Review Information:
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography><strong>Account:</strong> {formData.accountNumber}</Typography>
                <Typography><strong>Consumer:</strong> {formData.consumerName}</Typography>
                <Typography><strong>Bill Month:</strong> {formData.billMonth}</Typography>
                <Typography><strong>Amount Due:</strong> Rs. {formData.totalAmountDue}</Typography>
                {formData.address && <Typography><strong>Address:</strong> {formData.address}</Typography>}
                {formData.mobileNumber && <Typography><strong>Mobile:</strong> {formData.mobileNumber}</Typography>}
                {formData.email && <Typography><strong>Email:</strong> {formData.email}</Typography>}
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
        px: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 800,
          mx: 'auto',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            align="center"
            sx={{ fontWeight: 600, color: 'primary.main', mb: 4 }}
          >
            Add Electricity Bill
          </Typography>

          {/* Debug Panel */}
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#666' }}>
              Debug Panel (remove in production)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => {
                  console.log('Current state:', {
                    activeStep,
                    loading,
                    success,
                    hasReachedUploadRef: hasReachedUploadRef.current,
                    hasSubmittedAutomatically: hasSubmittedAutomatically.current,
                    isStep3Render: isStep3Render.current,
                    formData,
                    file: file?.name
                  });
                }}
              >
                Log State
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                color="warning"
                onClick={handleManualReset}
              >
                Reset Loading
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                color="info"
                onClick={() => {
                  console.log('Flags:', {
                    hasReachedUploadRef: hasReachedUploadRef.current,
                    hasSubmittedAutomatically: hasSubmittedAutomatically.current,
                    isStep3Render: isStep3Render.current
                  });
                }}
              >
                Check Flags
              </Button>
            </Box>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Success Snackbar */}
          <Snackbar
            open={openSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
          >
            <Alert 
              severity="success" 
              sx={{ 
                width: '100%',
                borderRadius: 2,
                boxShadow: 3,
                '& .MuiAlert-icon': { fontSize: 28 }
              }}
              onClose={() => setOpenSnackbar(false)}
            >
              <Typography variant="h6">✓ Bill Created Successfully!</Typography>
              <Typography variant="body2">Form will reset in 3 seconds...</Typography>
            </Alert>
          </Snackbar>

          {/* Error Alert */}
          {error && !success && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError('')}
              action={
                (error.includes('Make sure backend') || error.includes('timed out')) && (
                  <Button color="inherit" size="small" onClick={handleManualReset}>
                    Reset
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                startIcon={<ArrowBack />}
                variant="outlined"
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Manual reset button for debugging - shows only when loading is stuck */}
                {loading && (
                  <Button
                    onClick={handleManualReset}
                    color="warning"
                    variant="outlined"
                    size="small"
                  >
                    Reset
                  </Button>
                )}
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || success}
                    endIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                    ref={submitButtonRef}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      minWidth: '120px'
                    }}
                  >
                    {loading ? 'Creating...' : (success ? 'Created!' : 'Create Bill')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    disabled={loading}
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BillForm;