// src/components/DashboardCards.js
import React from 'react';
import { Box, Card, CardContent, Typography, Grid2 } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const DashboardCards = ({ data }) => {
  return (
    <Grid2 container spacing={2} sx={{ mt: 4 }}>
      <Grid2 item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalActiveStudents}</Typography>
            <Typography color="textSecondary">Active Students</Typography>
            <PeopleIcon />
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalInactiveStudentsYear}</Typography>
            <Typography color="textSecondary">Inactive Students</Typography>
            <PeopleIcon />
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalPaidViaCashToday}</Typography>
            <Typography color="textSecondary">Cash Today</Typography>
            <MonetizationOnIcon />
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalBankedToday}</Typography>
            <Typography color="textSecondary">Bank Today</Typography>
            <MonetizationOnIcon />
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default DashboardCards;
