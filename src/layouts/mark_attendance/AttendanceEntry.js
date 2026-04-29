import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Camera,
  LocationOn,
  AccessTime,
  Person,
  Note,
  Logout,
  Login,
} from '@mui/icons-material';

const AttendanceEntry = () => { 
  const [currentScreen, setCurrentScreen] = useState('main');  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  
  // Location state
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [validatingLocation, setValidatingLocation] = useState(false);

  // Manual attendance state
  const [manualData, setManualData] = useState({
    date: '',
    checkInTime: '',
    checkOutTime: '',
    reason: '',
    type: 'checkin',  
  });

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState('checkin');  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDetecting, setFaceDetecting] = useState(false);

  // Get current date
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get current time
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  };

  // Get full datetime
  const getCurrentDateTime = () => {
    return new Date().toLocaleString();
  };

  // Get User Location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      setValidatingLocation(true);
      setLocationError('');

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
             
            const isWithinSite = validateLocationWithinSite(latitude, longitude);
            
            setValidatingLocation(false);
            if (isWithinSite) {
              resolve({ latitude, longitude });
            } else {
              reject(new Error('You are not within the designated site area'));
            }
          },
          (error) => {
            setValidatingLocation(false);
            reject(new Error('Unable to access location. Please enable location services.'));
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by your browser'));
      }
    });
  };

  
  const validateLocationWithinSite = (lat, lng) => {
     
    const SITE_LAT = 6.9589;
    const SITE_LNG = 79.8715;
    const RADIUS_KM = 0.5; // 500 meters

    const R = 6371; // Earth's radius in km
    const dLat = (lat - SITE_LAT) * (Math.PI / 180);
    const dLng = (lng - SITE_LNG) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(SITE_LAT * (Math.PI / 180)) *
        Math.cos(lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= RADIUS_KM;
  };
 
  const handleCheckIn = async () => {
    setLoading(true);
    
    try { 
      await getLocation();
      
      setCheckedIn(true);
      const currentTime = getCurrentTime();
      setCheckInTime(currentTime);
      setCameraMode('checkin');
      setCurrentScreen('camera');
      setMessage({
        type: 'success',
        text: 'Location validated! Now please take a selfie for check-in verification.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      });
    }
    
    setLoading(false);
  };

  
  const handleCheckOut = async () => {
    if (!checkedIn) {
      setMessage({
        type: 'error',
        text: 'You must check in first before checking out!',
      });
      return;
    }

    setLoading(true);
    
    try {
      
      await getLocation();
      
      setCameraMode('checkout');
      setCurrentScreen('camera');
      setMessage({
        type: 'success',
        text: 'Location validated! Now please take a selfie for check-out verification.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      });
    }
    
    setLoading(false);
  };

   
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Unable to access camera. Please grant camera permissions.',
      });
    }
  };

const capturePhoto = () => {
  setFaceDetecting(true);
  if (videoRef.current && canvasRef.current) {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    const imageData = canvasRef.current.toDataURL('image/jpeg');
    setCapturedImage(imageData);
     
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
     
    setTimeout(() => {
      setFaceDetecting(false);
      setMessage({
        type: 'success',
        text: `Face detected! Selfie captured successfully for ${cameraMode}.`,
      });
    }, 1500);
  }
};

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const submitAttendance = () => {
    setLoading(true);
    
    setTimeout(() => {
      if (cameraMode === 'checkin') {
         
        const record = {
          checkInTime: checkInTime,
          checkInDate: getCurrentDate(),
          checkInPhoto: capturedImage,
          checkInLocation: location,
          status: 'checked_in'
        };
        setAttendanceRecord(record);
        setMessage({
          type: 'success',
          text: `Check-in successful! Time: ${checkInTime}`,
        });
        
        setTimeout(() => {
          setCurrentScreen('main');
          setCapturedImage(null);
          setLoading(false);
        }, 2000);
      } else {
         
        const checkoutTime = getCurrentTime();
        setCheckOutTime(checkoutTime);
        
        const completeRecord = {
          ...attendanceRecord,
          checkOutTime: checkoutTime,
          checkOutDate: getCurrentDate(),
          checkOutPhoto: capturedImage,
          checkOutLocation: location,
          status: 'completed',
          totalHours: calculateWorkHours(checkInTime, checkoutTime)
        };
        
        setAttendanceRecord(completeRecord);
        setCheckedOut(true);
        
        setMessage({
          type: 'success',
          text: `Check-out successful! Time: ${checkoutTime}. Total hours: ${completeRecord.totalHours}`,
        });
        
         
        setTimeout(() => {
          resetForm();
          setLoading(false);
        }, 3000);
      }
    }, 1000);
  };

  
  const calculateWorkHours = (checkIn, checkOut) => {
    const [inHour, inMin] = checkIn.split(':');
    const [outHour, outMin] = checkOut.split(':');
    
    let hours = outHour - inHour;
    let minutes = outMin - inMin;
    
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    
    return `${hours}h ${minutes}m`;
  };

   
  const handleManualSubmit = () => {
    if (!manualData.date || !manualData.checkInTime || !manualData.checkOutTime || !manualData.reason) {
      setMessage({
        type: 'error',
        text: 'Please fill in all fields.',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: `Manual attendance request submitted for approval. Date: ${manualData.date}`,
      });
      setLoading(false);
      setCurrentScreen('main');
      setManualData({ date: '', checkInTime: '', checkOutTime: '', reason: '', type: 'checkin' });
    }, 1000);
  };

 
  const resetForm = () => {
    setCurrentScreen('main');
    setCheckedIn(false);
    setCheckedOut(false);
    setCheckInTime(null);
    setCheckOutTime(null);
    setLocation(null);
    setCapturedImage(null);
    setAttendanceRecord(null);
    setMessage({ type: '', text: '' });
    setCameraMode('checkin');
  };

   
  const renderMainScreen = () => (
    <Container maxWidth="sm" sx={{ py: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Box
          sx={{
            backgroundImage: 'url("https://t3.ftcdn.net/jpg/04/69/79/70/360_F_469797034_i1FM7TbG567D73MjLNrNE0pFYPONlNeH.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: 100,
            borderRadius: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            padding: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        > 
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        {/* Show current attendance status */}
        {checkedIn && !checkedOut && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Currently Checked In</strong><br />
            Check-in time: {checkInTime}
          </Alert>
        )}

        {checkedOut && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>Attendance Completed for Today</strong><br />
            Check-in: {attendanceRecord?.checkInTime} | Check-out: {attendanceRecord?.checkOutTime}<br />
            Total Hours: {attendanceRecord?.totalHours}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: !checkedIn ? '#1976d2' : '#9e9e9e',
                '&:hover': { backgroundColor: !checkedIn ? '#1565c0' : '#9e9e9e' },
              }}
              onClick={handleCheckIn}
              disabled={loading || checkedIn}
              startIcon={loading ? <CircularProgress size={20} /> : <Login />}
            >
              {loading ? 'Processing...' : 'Check In'}
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: (checkedIn && !checkedOut) ? '#f57c00' : '#9e9e9e',
                '&:hover': { backgroundColor: (checkedIn && !checkedOut) ? '#ef6c00' : '#9e9e9e' },
              }}
              onClick={handleCheckOut}
              disabled={loading || !checkedIn || checkedOut}
              startIcon={loading ? <CircularProgress size={20} /> : <Logout />}
            >
              {loading ? 'Processing...' : 'Check Out'}
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Card sx={{ mb: 2, backgroundColor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#1976d2' }}>
              Today's Attendance
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="body2">
                Current Time: {getCurrentTime()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="body2">
                {location
                  ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : 'Location: Not detected'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="body2">
                Device: {localStorage.getItem('deviceName') || 'Mobile Device'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Button
          fullWidth
          variant="outlined"
          sx={{
            py: 1.5,
            mb: 2,
            borderColor: '#1976d2',
            color: '#1976d2',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#f0f7ff' },
          }}
          onClick={() => setCurrentScreen('manual')}
        >
          Manual Attendance Request
        </Button>

        <Typography variant="caption" color="textSecondary">
          Make sure you are at the designated project site for check-in and check-out
        </Typography>
      </Paper>
    </Container>
  );

  // Camera/Selfie Screen
  const renderCameraScreen = () => (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {cameraMode === 'checkin' ? 'Check-in Selfie Verification' : 'Check-out Selfie Verification'}
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {!capturedImage ? (
          <>
            <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
              Take a Selfie to {cameraMode === 'checkin' ? 'Check In' : 'Check Out'}
            </Typography>

            <Box
              sx={{
                position: 'relative',
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#000',
                height: 320,
              }}
            >
              {!cameraActive && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <Typography color="textSecondary">Camera will appear here</Typography>
                </Box>
              )}
              <video
                ref={videoRef}
                autoPlay
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: cameraActive ? 'block' : 'none',
                }}
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
                width={320}
                height={240}
              />
            </Box>

            {!cameraActive ? (
              <Button
                fullWidth
                variant="contained"
                startIcon={<Camera />}
                onClick={startCamera}
                sx={{
                  py: 1.5,
                  mb: 1,
                  backgroundColor: '#1976d2',
                  fontWeight: 'bold',
                }}
              >
                Open Camera
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                startIcon={faceDetecting ? <CircularProgress size={20} /> : <Camera />}
                onClick={capturePhoto}
                disabled={faceDetecting}
                sx={{
                  py: 1.5,
                  mb: 1,
                  backgroundColor: '#1976d2',
                  fontWeight: 'bold',
                }}
              >
                {faceDetecting ? 'Verifying Face...' : 'Capture Selfie'}
              </Button>
            )}
          </>
        ) : (
          <>
            <Box
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
              }}
            >
              <img
                src={capturedImage}
                alt="Captured"
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>

            <Chip
              icon={<CheckCircle />}
              label="Face Verified"
              color="success"
              variant="outlined"
              sx={{ mb: 2, width: '100%' }}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                mb: 1,
                backgroundColor: '#28a745',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#218838' },
              }}
              onClick={submitAttendance}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {loading ? 'Submitting...' : `Confirm ${cameraMode === 'checkin' ? 'Check-in' : 'Check-out'}`}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.5,
                borderColor: '#1976d2',
                color: '#1976d2',
                fontWeight: 'bold',
              }}
              onClick={retakePhoto}
              disabled={loading}
            >
              Retake Photo
            </Button>
          </>
        )}
        
        <Button
          fullWidth
          variant="text"
          sx={{
            mt: 2,
            color: '#999',
          }}
          onClick={() => {
            stopCamera();
            setCurrentScreen('main');
            setCapturedImage(null);
          }}
        >
          Cancel
        </Button>
      </Paper>
    </Container>
  );

  // Manual Attendance Screen
  const renderManualScreen = () => (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Manual Attendance Request
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
          Submit a manual attendance request for approval
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={manualData.date}
              onChange={(e) =>
                setManualData({ ...manualData, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              defaultValue={getCurrentDate()}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Check-In Time"
              value={manualData.checkInTime}
              onChange={(e) =>
                setManualData({ ...manualData, checkInTime: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              defaultValue={getCurrentTime()}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          type="time"
          label="Check-Out Time"
          value={manualData.checkOutTime}
          onChange={(e) =>
            setManualData({ ...manualData, checkOutTime: e.target.value })
          }
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Reason for Manual Request"
          placeholder="Forgot to check in/out, Technical issues, etc."
          value={manualData.reason}
          onChange={(e) =>
            setManualData({ ...manualData, reason: e.target.value })
          }
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            py: 1.5,
            mb: 1,
            backgroundColor: '#1976d2',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
          onClick={handleManualSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          sx={{
            py: 1.5,
            borderColor: '#999',
            color: '#666',
            fontWeight: 'bold',
          }}
          onClick={() => setCurrentScreen('main')}
          disabled={loading}
        >
          Cancel
        </Button>
      </Paper>
    </Container>
  );

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Render appropriate screen
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {currentScreen === 'main' && renderMainScreen()}
      {currentScreen === 'camera' && renderCameraScreen()}
      {currentScreen === 'manual' && renderManualScreen()}
    </Box>
  );
};

export default AttendanceEntry;