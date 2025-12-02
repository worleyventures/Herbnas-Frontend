import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiTruck, HiBuildingOffice2, HiMagnifyingGlass, HiPlus } from 'react-icons/hi2';
import { StatCard, SearchInput, Pagination, Loading, EmptyState, Button } from '../../components/common';
import { getUniqueSuppliers } from '../../redux/actions/inventoryActions';

const VendorsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  // Local state
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        // Fetch suppliers (with pagination - fetch all pages)
        let allSuppliers = [];
        let supplierPage = 1;
        let hasMoreSuppliers = true;
        while (hasMoreSuppliers) {
          const suppliersResult = await dispatch(getUniqueSuppliers({ page: supplierPage, limit: 100 })).unwrap();
          const suppliersList = suppliersResult.data || [];
          allSuppliers = [...allSuppliers, ...suppliersList];
          const totalSupplierPages = suppliersResult.pagination?.totalPages || 1;
          hasMoreSuppliers = supplierPage < totalSupplierPages && suppliersList.length > 0;
          supplierPage++;
          if (supplierPage > 100) break; // Safety limit
        }
        setSuppliers(allSuppliers);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [dispatch]);

  // Map suppliers to vendor format
  const allVendors = useMemo(() => {
    return suppliers.map(supplier => ({
      _id: supplier.supplierId || supplier._id,
      name: supplier.supplierName || 'Unknown Supplier',
      type: 'supplier',
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      gstNumber: supplier.gstNumber,
      hsn: supplier.hsn,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email,
      outstandingBalance: supplier.outstandingBalance || 0
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers]);

  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return allVendors;
    
    const searchLower = searchTerm.toLowerCase();
    return allVendors.filter(vendor => 
      vendor.name?.toLowerCase().includes(searchLower) ||
      vendor.supplierName?.toLowerCase().includes(searchLower) ||
      vendor.gstNumber?.toLowerCase().includes(searchLower) ||
      vendor.hsn?.toLowerCase().includes(searchLower) ||
      vendor.phone?.toLowerCase().includes(searchLower) ||
      vendor.email?.toLowerCase().includes(searchLower) ||
      vendor.contactName?.toLowerCase().includes(searchLower)
    );
  }, [allVendors, searchTerm]);

  // Paginate vendors
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVendors.slice(startIndex, endIndex);
  }, [filteredVendors, currentPage, itemsPerPage]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalVendors = filteredVendors.length;
    const vendorsWithGST = filteredVendors.filter(v => v.gstNumber).length;
    const vendorsWithContact = filteredVendors.filter(v => v.phone || v.email).length;
    const totalOutstandingBalance = filteredVendors.reduce((sum, v) => sum + (v.outstandingBalance || 0), 0);

    return {
      totalVendors,
      vendorsWithGST,
      vendorsWithContact,
      totalOutstandingBalance
    };
  }, [filteredVendors]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredVendors.length);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">
            View all vendors from whom materials are purchased
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            className='sm:w-auto w-full'
            onClick={() => navigate('/vendors/create')}
            variant="gradient"
            icon={HiPlus}
          >
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon={HiTruck}
          gradient="blue"
          loading={loading}
        />
        <StatCard
          title="With GST Number"
          value={stats.vendorsWithGST}
          icon={HiBuildingOffice2}
          gradient="green"
          loading={loading}
        />
        <StatCard
          title="With Contact Info"
          value={stats.vendorsWithContact}
          icon={HiBuildingOffice2}
          gradient="purple"
          loading={loading}
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${stats.totalOutstandingBalance.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}`}
          icon={HiBuildingOffice2}
          gradient="red"
          loading={loading}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search suppliers by name, GST, HSN, phone, email..."
            icon={HiMagnifyingGlass}
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Vendors</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {startIndex} to {endIndex} of {filteredVendors.length} vendors
          </p>
        </div>

        {filteredVendors.length === 0 ? (
          <EmptyState
            icon={HiTruck}
            title="No vendors found"
            message={searchTerm ? "Try adjusting your search criteria" : "No vendors available"}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GST Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HSN Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outstanding Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedVendors.map((vendor) => (
                    <tr 
                      key={vendor._id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        // Navigate to accounts page with vendor information
                        navigate('/accounts', {
                          state: {
                            vendor: {
                              _id: vendor.supplierId || vendor._id,
                              name: vendor.supplierName || vendor.name,
                              type: 'supplier',
                              supplierId: vendor.supplierId,
                              supplierName: vendor.supplierName,
                              gstNumber: vendor.gstNumber,
                              hsn: vendor.hsn,
                              contactName: vendor.contactName,
                              phone: vendor.phone,
                              email: vendor.email,
                              outstandingBalance: vendor.outstandingBalance || 0
                            }
                          }
                        });
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                        {vendor.supplierId && (
                          <div className="text-xs text-gray-500">ID: {vendor.supplierId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vendor.gstNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vendor.hsn || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {vendor.contactName || vendor.phone || vendor.email ? (
                          <div className="space-y-1">
                            {vendor.contactName && (
                              <div className="text-sm font-medium text-gray-900">
                                {vendor.contactName}
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="text-xs text-gray-600">
                                📞 {vendor.phone}
                              </div>
                            )}
                            {vendor.email && (
                              <div className="text-xs text-gray-600">
                                ✉️ {vendor.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">No contact details</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vendor.outstandingBalance > 0 ? (
                          <div className="text-sm font-semibold text-red-600">
                            ₹{vendor.outstandingBalance.toLocaleString('en-IN', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            ₹0.00
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredVendors.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;

