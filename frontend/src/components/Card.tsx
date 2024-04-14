import React from 'react';
import { Card, Metric, Text } from '@tremor/react';

export function CardUsageExample({ text, number }) {
  return (
    <Card
      className="mx-auto max-w-xs h-max"
      decoration="top"
      decorationColor="indigo"
    >
      <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{text}</p>
      <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{number}</p>
    </Card>
  );
}