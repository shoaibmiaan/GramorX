import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import BandPredictorForm from '@/components/predictor/BandPredictorForm';

const PredictorPage: NextPage = () => {
  return (
    <>
      <Head><title>IELTS Band Predictor</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-3xl font-semibold">IELTS Band Predictor</h1>
          <p className="text-sm text-muted-foreground">
            Enter a few quick metrics and we’ll estimate your current band + give targeted advice.
          </p>

          <BandPredictorForm className="mt-6" navigateToResult />
        </div>
      </main>
    </>
  );
};

export default PredictorPage;
