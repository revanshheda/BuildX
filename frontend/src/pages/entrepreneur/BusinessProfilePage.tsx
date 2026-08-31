

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { SECTORS_DATA } from '@/lib/data/hero-data';
import {
  Building2,
  MapPin,
  Briefcase,
  Sliders,
  CheckCircle,
  ArrowRight,
  Save,
  AlertTriangle,
  Info,
  User,
} from 'lucide-react';

export default function BusinessProfilePage() {
  const { business, updateBusiness } = useAppStore();
  const [formData, setFormData] = useState(business);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedSector = SECTORS_DATA.find((s) => s.name === formData.sector) || SECTORS_DATA[0];
  const selectedSubSector = selectedSector.subSectors.find((sub) => sub.name === formData.subSector);
  const isColdStorage = formData.subSector === 'Cold Storage / Cold Chain';
  const isNotConfigured = selectedSubSector?.status === 'NOT_CONFIGURED';

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectorChange = (sectorName: string) => {
    const sec = SECTORS_DATA.find((s) => s.name === sectorName);
    const firstSub = sec?.subSectors[0]?.name || '';
    setFormData((prev) => ({ ...prev, sector: sectorName, subSector: firstSub }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-blue">INPUT LAYER</span>
            <span className="badge badge-green">COMPLETION: {business.profileCompletionPct}%</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            Business & Project Profile
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Enter your business parameters once. The intelligence engine evaluates these 20+ parameters to derive your personalized approval pathway.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleSubmit} className="btn btn-primary">
            <Save size={14} /> Save Profile
          </button>
          <Link to="/intelligence" className="btn btn-outline-primary">
            Analyze Approvals <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            color: '#15803d',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} />
          <span>Business Profile successfully updated and synchronized.</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Business Identity */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#1d4ed8" /> 1. Business Legal Identity
              </div>
              <div className="card-subtitle">Official registration and corporate identity details</div>
            </div>
            <span className="badge badge-neutral">VERIFIED ENTITY</span>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Legal Business Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trade / Facility Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.tradeName}
                onChange={(e) => handleChange('tradeName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entity Constitution *</label>
              <select
                className="form-select"
                value={formData.entityType}
                onChange={(e) => handleChange('entityType', e.target.value)}
              >
                <option value="Private Limited Company">Private Limited Company</option>
                <option value="Public Limited Company">Public Limited Company</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
                <option value="Partnership">Partnership Firm</option>
                <option value="Proprietorship">Sole Proprietorship</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Corporate Identification (CIN)</label>
              <input
                type="text"
                className="form-input"
                value={formData.cin}
                onChange={(e) => handleChange('cin', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company PAN *</label>
              <input
                type="text"
                className="form-input"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maharashtra GSTIN *</label>
              <input
                type="text"
                className="form-input"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Sector & Sub-sector Selection */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="#1d4ed8" /> 2. Sector Classification (Maharashtra Prototype Scope)
              </div>
              <div className="card-subtitle">Exactly 4 sectors and 12 sub-sectors supported in prototype</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Primary Industry Sector *</label>
              <select
                className="form-select"
                value={formData.sector}
                onChange={(e) => handleSectorChange(e.target.value)}
              >
                {SECTORS_DATA.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-Sector Classification *</label>
              <select
                className="form-select"
                value={formData.subSector}
                onChange={(e) => handleChange('subSector', e.target.value)}
              >
                {selectedSector.subSectors.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name} {sub.status === 'CONFIGURED' ? '— (Hero Scope: Fully Configured)' : '— (Prototype: Not Configured)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isNotConfigured && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 14px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                color: '#b45309',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>
                <strong>Note:</strong> <em>{formData.subSector}</em> is preserved for navigation and scalability demonstration, but marked as <strong>NOT_CONFIGURED / NEEDS_REVIEW</strong> in accordance with prototype accuracy rules.
              </span>
            </div>
          )}
        </div>

        {/* Section 3: Project Location */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#1d4ed8" /> 3. Project Location (Maharashtra State)
              </div>
              <div className="card-subtitle">Determines local planning authority, MIDC jurisdiction, and utility zones</div>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" className="form-input" value="Maharashtra" disabled />
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              <input
                type="text"
                className="form-input"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Taluka</label>
              <input
                type="text"
                className="form-input"
                value={formData.taluka}
                onChange={(e) => handleChange('taluka', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Village / Industrial City</label>
              <input
                type="text"
                className="form-input"
                value={formData.villageCity}
                onChange={(e) => handleChange('villageCity', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location Type *</label>
              <select
                className="form-select"
                value={formData.locationType}
                onChange={(e) => handleChange('locationType', e.target.value)}
              >
                <option value="MIDC">MIDC (Maharashtra Industrial Development Corp)</option>
                <option value="Non-MIDC">Non-MIDC / Private Industrial Zone</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Industrial Area Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.industrialArea}
                onChange={(e) => handleChange('industrialArea', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Plot Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.plotNumber}
                onChange={(e) => handleChange('plotNumber', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                className="form-input"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Project Scale & Utilities */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#1d4ed8" /> 4. Project Scale, Scope & Utility Demands
              </div>
              <div className="card-subtitle">Key determinants for MPCB categorization, factory licenses, and utility sanctions</div>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Project Type *</label>
              <select
                className="form-select"
                value={formData.projectType}
                onChange={(e) => handleChange('projectType', e.target.value)}
              >
                <option value="New Project">New Project (Greenfield)</option>
                <option value="Expansion">Expansion / Modernization</option>
                <option value="Diversification">Diversification of Activity</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Project Stage *</label>
              <select
                className="form-select"
                value={formData.projectStage}
                onChange={(e) => handleChange('projectStage', e.target.value)}
              >
                <option value="Proposed / Pre-Construction">Proposed / Pre-Construction</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Ready for Commissioning">Ready for Commissioning</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Capital Investment (INR) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.totalInvestmentInr}
                onChange={(e) => handleChange('totalInvestmentInr', Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>₹{(formData.totalInvestmentInr / 10000000).toFixed(2)} Crores</span>
            </div>

            <div className="form-group">
              <label className="form-label">Proposed Employment (Headcount) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.proposedEmployment}
                onChange={(e) => handleChange('proposedEmployment', Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Built-up Area (Sq. Ft.) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.builtUpAreaSqft}
                onChange={(e) => handleChange('builtUpAreaSqft', Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Connected Power Demand (kW) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.powerRequirementKw}
                onChange={(e) => handleChange('powerRequirementKw', Number(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 5: Dynamic Sector Questions (Cold Storage Hero) */}
        {isColdStorage && (
          <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #1d4ed8' }}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={18} color="#1d4ed8" /> 5. Dynamic Sub-Sector Parameters (Cold Chain Specific)
                </div>
                <div className="card-subtitle">Triggers FSSAI Central License vs State License & Ammonia Fire safety rules</div>
              </div>
              <span className="badge badge-blue">HERO INTELLIGENCE TRIGGER</span>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Food / Agricultural Storage Involved? *</label>
                <select
                  className="form-select"
                  value={formData.isFoodStorage ? 'true' : 'false'}
                  onChange={(e) => handleChange('isFoodStorage', e.target.value === 'true')}
                >
                  <option value="true">Yes — Food / Dairy / Perishables Stored (FSSAI Triggered)</option>
                  <option value="false">No — Non-food chemicals/industrial goods only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Storage Capacity (Metric Tonnes - MT) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.storageCapacityMt}
                  onChange={(e) => handleChange('storageCapacityMt', Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>Capacity &gt; 10,000 MT or multi-state triggers Central License</span>
              </div>

              <div className="form-group">
                <label className="form-label">Operating Temperature Range</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.temperatureRange}
                  onChange={(e) => handleChange('temperatureRange', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Authorized Contact Person */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#1d4ed8" /> 6. Authorized Representative & Key Contact
              </div>
              <div className="card-subtitle">Primary signatory for declarations and government communications</div>
            </div>
          </div>

          <div className="grid-4">
            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation *</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactDesignation}
                onChange={(e) => handleChange('contactDesignation', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email *</label>
              <input
                type="email"
                className="form-input"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '32px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={16} /> Save Business Profile
          </button>
          <Link to="/intelligence" className="btn btn-outline-primary" style={{ padding: '10px 24px' }}>
            Proceed to Approval Intelligence <ArrowRight size={16} />
          </Link>
        </div>
      </form>
    </div>
  );
}
