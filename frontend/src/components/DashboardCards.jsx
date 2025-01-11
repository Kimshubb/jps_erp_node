// src/components/DashboardCards.js
import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const DashboardCards = ({ data }) => {
  return (
    <Grid container spacing={2} sx={{ mt: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalActiveStudents}</Typography>
            <Typography color="textSecondary">Active Students</Typography>
            <PeopleIcon />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalInactiveStudentsTerm}</Typography>
            <Typography color="textSecondary">Inactive Students</Typography>
            <PeopleIcon />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalPaidViaCashToday}</Typography>
            <Typography color="textSecondary">Cash Total Today</Typography>
            <MonetizationOnIcon />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h5">{data.totalBankedToday}</Typography>
            <Typography color="textSecondary">Bank Total Today</Typography>
            <MonetizationOnIcon />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardCards;
