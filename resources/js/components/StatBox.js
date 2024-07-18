// src/components/StatBox.js
import React from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import '../css/Dashboard.css';

const StatBox = ({ title, value }) => (
  <Card className="shadow-sm mb-4">
    <CardHeader className="card-header text-white text-center custom-header">
      <h1 className='card-header'>{title}</h1>
    </CardHeader>
    <CardBody className="text-center">
      <h2>{value}</h2>
    </CardBody>
  </Card>
);

export default StatBox;
