import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TermsAndConditions from './TermsAndConditions';

export default function Terms() {
  return (
    <AppLayout>
      <Head title="Terms and Conditions" />

          <TermsAndConditions />

    </AppLayout>
  );
}
