import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Collapse,
  IconButton,
  Button,
  Grid,
  Card,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  Divider,
  Avatar,
  SwipeableDrawer,
  Fab,
  Zoom,
  Badge
} from '@mui/material';
import {
  Business,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Close,
  Visibility,
  People,
  TrendingUp,
  AccessTime,
  Person,
  ArrowUpward,
  CheckCircle,
  Cancel,
  LocationOn
} from '@mui/icons-material';

// ─── Helpers ────────────────────────────────────────────────────────────────
const isPresent = (emp) => emp.inn && emp.inn !== 'NR' && emp.inn !== '';

// ─── Mobile: Single Location Panel ──────────────────────────────────────────
const MobileLocationPanel = React.memo(({ location, employees, isExpanded, onToggle, onViewAll }) => {
  const strength = employees.length;
  const present = employees.filter(isPresent).length;
  const absent = strength - present;
  const rate = strength > 0 ? Math.round((present / strength) * 100) : 0;
  const rateColor = rate >= 80 ? '#16a34a' : rate >= 60 ? '#d97706' : '#dc2626';

  return (
    <Box sx={{ mb: 1.5 }}>
      {/* ── Location Header Row (always visible) ── */}
      <Box
        onClick={() => onToggle(location)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: isExpanded ? '#004AAD' : '#fff',
          border: '1.5px solid',
          borderColor: isExpanded ? '#004AAD' : '#e2e8f0',
          borderRadius: isExpanded ? '14px 14px 0 0' : '14px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          userSelect: 'none',
        }}
      >
        {/* Icon */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: isExpanded ? 'rgba(255,255,255,0.2)' : '#e8f0fe',
            flexShrink: 0,
          }}
        >
          <LocationOn sx={{ fontSize: 18, color: isExpanded ? '#fff' : '#004AAD' }} />
        </Avatar>

        {/* Name */}
        <Typography
          sx={{
            flex: 1,
            fontWeight: 700,
            fontSize: '0.88rem',
            color: isExpanded ? '#fff' : '#1e293b',
            lineHeight: 1.3,
          }}
        >
          {location}
        </Typography>

        {/* Stats pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          <Chip
            icon={<People sx={{ fontSize: '13px !important', color: isExpanded ? '#fff !important' : '#004AAD !important' }} />}
            label={strength}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.72rem',
              fontWeight: 700,
              bgcolor: isExpanded ? 'rgba(255,255,255,0.18)' : '#e8f0fe',
              color: isExpanded ? '#fff' : '#004AAD',
              '& .MuiChip-icon': { ml: '4px' },
            }}
          />
          <Chip
            label={`${rate}%`}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.72rem',
              fontWeight: 700,
              bgcolor: isExpanded ? 'rgba(255,255,255,0.18)' : `${rateColor}18`,
              color: isExpanded ? '#fff' : rateColor,
            }}
          />
        </Box>

        {/* Chevron */}
        <Box
          sx={{
            flexShrink: 0,
            transition: 'transform 0.25s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: isExpanded ? '#fff' : '#94a3b8',
          }}
        >
          <KeyboardArrowDown />
        </Box>
      </Box>

      {/* ── Expanded Content ── */}
      <Collapse in={isExpanded} timeout={250} unmountOnExit>
        <Box
          sx={{
            border: '1.5px solid #004AAD',
            borderTop: 'none',
            borderRadius: '0 0 14px 14px',
            overflow: 'hidden',
            bgcolor: '#f8faff',
          }}
        >
          {/* Mini summary bar */}
          <Box
            sx={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              bgcolor: '#fff',
            }}
          >
            {[
              { label: 'Strength', value: strength, color: '#004AAD', bg: '#e8f0fe' },
              { label: 'Present', value: present, color: '#16a34a', bg: '#dcfce7' },
              { label: 'Absent', value: absent, color: '#dc2626', bg: '#fee2e2' },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 1.5,
                  borderRight: '1px solid #f1f5f9',
                  '&:last-child': { borderRight: 'none' },
                }}
              >
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mb: 0.3 }}>
                  {s.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: s.color,
                  }}
                >
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Employee mini-table */}
          <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
            {/* Table header */}
            <Box
              sx={{
                display: 'grid',
                // gridTemplateColumns: '1fr 1.4fr 0.7fr 0.7fr',
                gridTemplateColumns: '1fr 1.4fr 1.4fr 0.5fr',
                gap: 0.5,
                px: 1,
                py: 0.75,
                bgcolor: '#e8f0fe',
                borderRadius: '8px',
                mb: 0.5,
              }}
            >
              {/* {['Svc No', 'Name', 'IN Time', 'Status'].map((h) => ( */}
              {['Svc No', 'Name','Designation' ,'IN'].map((h) => (
                <Typography key={h} sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#004AAD' }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {/* Table rows — show all */}
            {/* {employees.map((emp, idx) => {
              const present = isPresent(emp);
              return (
                <Box
                  key={emp.sno || idx}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.4fr 0.7fr 0.7fr',
                    gap: 0.5,
                    px: 1,
                    py: 0.9,
                    bgcolor: idx % 2 === 0 ? '#fff' : '#f8faff',
                    borderRadius: '6px',
                    mb: 0.25,
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.68rem', color: '#475569' }}>
                    {emp.sno || '-'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {emp.repname || '-'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: present ? 700 : 400,
                      color: present ? '#16a34a' : '#94a3b8',
                    }}
                  >
                    {present ? emp.inn : 'NR'}
                  </Typography>
                  <Box>
                    {present ? (
                      <CheckCircle sx={{ fontSize: 16, color: '#16a34a' }} />
                    ) : (
                      <Cancel sx={{ fontSize: 16, color: '#dc2626' }} />
                    )}
                  </Box>
                </Box>
              );
            })} */}

            {employees.map((emp, idx) => {
              const present = isPresent(emp);
              return (
                <Box
                  key={emp.sno || idx}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.4fr 1.4fr 0.5fr',
                    gap: 0.5,
                    px: 1,
                    py: 0.9,
                    bgcolor: idx % 2 === 0 ? '#fff' : '#f8faff',
                    borderRadius: '6px',
                    mb: 0.25,
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.68rem', color: '#475569' }}>
                    {emp.sno || '-'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {emp.repname || '-'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {emp.des || '-'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: present ? 700 : 400,
                      color: present ? '#16a34a' : '#f30a0a',
                    }}
                  >
                    {present ? emp.inn : 'NR'}
                  </Typography>
                  
                </Box>
              );
            })}
          </Box>

          {/* View all button */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<Visibility />}
              onClick={(e) => {
                e.stopPropagation();
                onViewAll({ location, employees, strength, present, absent, rate });
              }}
              sx={{
                bgcolor: '#004AAD',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                py: 1,
                '&:hover': { bgcolor: '#002d7a' },
              }}
            >
              Full Details
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
});

// ─── Detail Drawer ───────────────────────────────────────────────────────────
const DetailDrawer = ({ open, onClose, data }) => {
  if (!data) return null;
  const { location, employees, strength, present, absent, rate } = data;
  const rateColor = rate >= 80 ? '#16a34a' : rate >= 60 ? '#d97706' : '#dc2626';

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* Pull indicator */}
      <Box sx={{ pt: 1.5, pb: 0.5, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: '#cbd5e1' }} />
      </Box>

      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: '#004AAD',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
            {location}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', mt: 0.3 }}>
            {strength} employees
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid #f1f5f9' }}>
        {[
          { label: 'Total', value: strength, color: '#004AAD' },
          { label: 'Present', value: present, color: '#16a34a' },
          { label: 'Absent', value: absent, color: '#dc2626' },
          { label: 'Rate', value: `${rate}%`, color: rateColor },
        ].map((s) => (
          <Box
            key={s.label}
            sx={{
              flex: 1,
              textAlign: 'center',
              py: 1.5,
              borderRight: '1px solid #f1f5f9',
              '&:last-child': { borderRight: 'none' },
            }}
          >
            <Typography sx={{ fontSize: '0.63rem', color: '#64748b' }}>{s.label}</Typography>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>
              {s.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Scrollable employee list */}
      <Box sx={{ overflowY: 'auto', flex: 1, px: 2, py: 1.5 }}>
        {/* Column headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '0.8fr 1.4fr 1fr 0.8fr 0.6fr',
            gap: 0.5,
            px: 1,
            py: 0.8,
            bgcolor: '#e8f0fe',
            borderRadius: '8px',
            mb: 1,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {['Svc No', 'Name', 'Designation', 'IN Time', 'Status'].map((h) => (
            <Typography key={h} sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#004AAD' }}>
              {h}
            </Typography>
          ))}
        </Box>

        {employees.map((emp, idx) => {
          const present = isPresent(emp);
          return (
            <Box
              key={emp.sno || idx}
              sx={{
                display: 'grid',
                gridTemplateColumns: '0.8fr 1.4fr 1fr 0.8fr 0.6fr',
                gap: 0.5,
                px: 1,
                py: 1,
                bgcolor: idx % 2 === 0 ? '#fff' : '#f8faff',
                borderRadius: '8px',
                mb: 0.5,
                alignItems: 'center',
                border: '1px solid #f1f5f9',
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', color: '#475569' }}>
                {emp.sno || '-'}
              </Typography>
              <Box>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                  {emp.repname || '-'}
                </Typography>
                <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                  {emp.cno ? `Clk: ${emp.cno}` : ''}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.2 }}>
                {emp.des || '-'}
              </Typography>
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: present ? 700 : 400,
                    color: present ? '#16a34a' : '#94a3b8',
                  }}
                >
                  {present ? emp.inn : 'NR'}
                </Typography>
                {emp.pout && (
                  <Typography sx={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                    OUT: {emp.pout}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {present ? (
                  <CheckCircle sx={{ fontSize: 16, color: '#16a34a' }} />
                ) : (
                  <Cancel sx={{ fontSize: 16, color: '#dc2626' }} />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </SwipeableDrawer>
  );
};

// ─── Desktop Table View ──────────────────────────────────────────────────────
const DesktopTableView = ({ locationGroups, expandedRow, onExpand, onViewDetails }) => (
  <TableContainer>
    <Table>
      <TableHead sx={{ bgcolor: '#004AAD' }}>
        <TableRow>
          <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '35%' }}>Location</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Strength</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Present</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Attendance</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(locationGroups).map(([location, employees]) => {
          const strength = employees.length;
          const present = employees.filter(isPresent).length;
          const absent = strength - present;
          const rate = strength > 0 ? Math.round((present / strength) * 100) : 0;
          const rateColor = rate >= 80 ? '#16a34a' : rate >= 60 ? '#d97706' : '#dc2626';
          const expanded = expandedRow === location;

          return (
            <React.Fragment key={location}>
              <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(0,74,173,0.04)' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business sx={{ color: '#004AAD' }} />
                    <Typography fontWeight={500}>{location}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip label={strength} size="small" sx={{ bgcolor: '#e8f0fe', color: '#004AAD', fontWeight: 'bold' }} />
                </TableCell>
                <TableCell align="center">
                  <Chip label={present} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 'bold' }} />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${rate}%`}
                    size="small"
                    sx={{ bgcolor: `${rateColor}18`, color: rateColor, fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => onExpand(location)} sx={{ color: '#004AAD' }}>
                    {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => onViewDetails({ location, employees, strength, present, absent, rate })}
                    sx={{ ml: 1, borderColor: '#004AAD', color: '#004AAD', textTransform: 'none' }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={5} sx={{ py: 0 }}>
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ m: 2, bgcolor: '#f8faff', borderRadius: '12px', p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: '#004AAD' }}>
                        Employee List — {location}
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#e8f0fe' }}>
                            {['Service No', 'Name', 'Designation', 'Clock No', 'IN Time', 'Prev. OUT', 'Status'].map(h => (
                              <TableCell key={h}><b>{h}</b></TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {employees.map((emp, idx) => {
                            const p = isPresent(emp);
                            return (
                              <TableRow key={emp.sno || idx}>
                                <TableCell>{emp.sno || '-'}</TableCell>
                                <TableCell>{emp.repname || '-'}</TableCell>
                                <TableCell>{emp.des || '-'}</TableCell>
                                <TableCell>{emp.cno || '-'}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={p ? emp.inn : 'NR'}
                                    size="small"
                                    sx={{ bgcolor: p ? '#dcfce7' : '#fee2e2', color: p ? '#16a34a' : '#dc2626', fontSize: '0.7rem' }}
                                  />
                                </TableCell>
                                <TableCell>{emp.pout || '-'}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={p ? 'Present' : 'Absent'}
                                    size="small"
                                    icon={p ? <CheckCircle sx={{ fontSize: '12px !important' }} /> : <Cancel sx={{ fontSize: '12px !important' }} />}
                                    sx={{ bgcolor: p ? '#dcfce7' : '#fee2e2', color: p ? '#16a34a' : '#dc2626', fontSize: '0.7rem' }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);

// ─── Main Export ─────────────────────────────────────────────────────────────
export const DGESatt = ({ data = [], loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [expandedRow, setExpandedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollRef = useRef(null); 
  const handleToggle = useCallback((location) => {
    setExpandedRow(prev => (prev === location ? null : location)); 
  }, []);

  const handleViewDetails = useCallback((locationData) => {
    setSelectedLocation(locationData);
    setDrawerOpen(true);
  }, []);

  const handleScroll = useCallback((e) => {
    setShowScrollTop(e.currentTarget.scrollTop > 200);
  }, []);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

   
  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <Typography>Loading DGES data...</Typography>
        </Box>
      </Paper>
    );
  }

   

  // ── Group by location ──
  const locationGroups = {};
  data.forEach(item => {
    const loc = item.loc?.trim() || 'Unknown';
    if (!locationGroups[loc]) locationGroups[loc] = [];
    locationGroups[loc].push(item);
  });

  const totalLocations = Object.keys(locationGroups).length;
  const totalEmployees = data.length;
  const totalPresent = data.filter(isPresent).length;

  return (
    <>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,74,173,0.06)' }}>
        <Typography
          variant="h6"
          sx={{ mb: 2.5, fontWeight: 700, color: '#004AAD', fontSize: { xs: '1rem', sm: '1.2rem' } }}
        >
          Based on Designation and Location
        </Typography>

        {/* ── Mobile ── */}
        {isMobile ? (
          <Box
            ref={scrollRef}
            onScroll={handleScroll}
            sx={{
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              pr: 0.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4 },
            }}
          >
            {Object.entries(locationGroups).map(([location, employees]) => (
              <MobileLocationPanel
                key={location}
                location={location}
                employees={employees}
                isExpanded={expandedRow === location}
                onToggle={handleToggle}
                onViewAll={handleViewDetails}
              />
            ))}

            {/* Spacer so last card isn't hidden by FAB */}
            <Box sx={{ height: 80 }} />
          </Box>
        ) : (
          /* ── Desktop ── */
          <DesktopTableView
            locationGroups={locationGroups}
            expandedRow={expandedRow}
            onExpand={handleToggle}
            onViewDetails={handleViewDetails}
          />
        )}
        
      </Paper>

      {/* Detail Drawer */}
      <DetailDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setTimeout(() => setSelectedLocation(null), 300); }}
        data={selectedLocation}
      />
    </>
  );
};