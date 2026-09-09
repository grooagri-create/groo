import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CustomizeFooter = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    logoUrl: '/logo.png',
    byline: 'By Chinmay Anand',
    description: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: ''
    },
    exploreTitle: 'Explore Groo',
    exploreLinks: [],
    contactTitle: 'Contact Support',
    address: '',
    phone: '',
    email: '',
    newsletterTitle: 'Stay Updated',
    newsletterSubtitle: '',
    copyrightText: ''
  });

  useEffect(() => {
    fetchFooterContent();
  }, []);

  const fetchFooterContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminAccessToken') || sessionStorage.getItem('adminAccessToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/admin/website/footer`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching footer content:', error);
      toast.error('Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  };

  const handleAddExploreLink = () => {
    setFormData(prev => ({
      ...prev,
      exploreLinks: [...prev.exploreLinks, { title: '', url: '' }]
    }));
  };

  const handleRemoveExploreLink = (index) => {
    setFormData(prev => ({
      ...prev,
      exploreLinks: prev.exploreLinks.filter((_, i) => i !== index)
    }));
  };

  const handleExploreLinkChange = (index, field, value) => {
    setFormData(prev => {
      const newLinks = [...prev.exploreLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, exploreLinks: newLinks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('adminAccessToken') || sessionStorage.getItem('adminAccessToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/admin/website/footer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Footer updated successfully');
      } else {
        toast.error(data.message || 'Failed to update footer');
      }
    } catch (error) {
      console.error('Error updating footer:', error);
      toast.error('Failed to update footer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customize Footer</h1>
          <p className="text-slate-500 text-sm mt-1">Manage public website footer content dynamically</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
        >
          <FiSave />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Brand Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Brand Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
              <input type="text" name="logoUrl" value={formData.logoUrl || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Byline (e.g. By Chinmay Anand)</label>
              <input type="text" name="byline" value={formData.byline || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Social Links</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
              <input type="text" name="facebook" value={formData.socialLinks?.facebook || ''} onChange={handleSocialChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
              <input type="text" name="instagram" value={formData.socialLinks?.instagram || ''} onChange={handleSocialChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
              <input type="text" name="linkedin" value={formData.socialLinks?.linkedin || ''} onChange={handleSocialChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Twitter URL</label>
              <input type="text" name="twitter" value={formData.socialLinks?.twitter || ''} onChange={handleSocialChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Explore Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-slate-800">Quick Links Column</h2>
            <button type="button" onClick={handleAddExploreLink} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700">
              <FiPlus /> Add Link
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Column Title</label>
            <input type="text" name="exploreTitle" value={formData.exploreTitle || ''} onChange={handleInputChange} className="w-full md:w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-3">
            {formData.exploreLinks?.map((link, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input type="text" placeholder="Title" value={link.title} onChange={(e) => handleExploreLinkChange(idx, 'title', e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="URL" value={link.url} onChange={(e) => handleExploreLinkChange(idx, 'url', e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => handleRemoveExploreLink(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Support & Contact</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Column Title</label>
              <input type="text" name="contactTitle" value={formData.contactTitle || ''} onChange={handleInputChange} className="w-full md:w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Newsletter & Copyright */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Newsletter & Copyright</h2>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Newsletter Title</label>
                <input type="text" name="newsletterTitle" value={formData.newsletterTitle || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Newsletter Subtitle</label>
                <input type="text" name="newsletterSubtitle" value={formData.newsletterSubtitle || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Copyright Text</label>
              <input type="text" name="copyrightText" value={formData.copyrightText || ''} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeFooter;
