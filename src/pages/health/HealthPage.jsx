import React, { useState } from 'react';
import { HiHeart, HiPlus } from 'react-icons/hi2';
import { PageHeader } from '../../components/layout';
import { Button } from '../../components/common';
import HealthDashboard from '../../components/dashboard/HealthDashboard';

const HealthPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateHealthIssue = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
     
      <HealthDashboard 
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      />
    </div>
  );
};

export default HealthPage;

