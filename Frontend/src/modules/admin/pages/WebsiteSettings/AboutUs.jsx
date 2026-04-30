import React, { useState, useEffect } from "react";
import { FiSave, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CardShell from "../../components/CardShell";
import API from "../../../../services/api";
import LogoLoader from "../../../../components/common/LogoLoader";

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: "About GROO",
    content: ""
  });

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const res = await API.get('/content/about');
      if (res.data.success && res.data.data) {
        setForm({
          title: res.data.data.title || "About GROO",
          content: res.data.data.content || ""
        });
      }
    } catch (error) {
      toast.error("Failed to load About Us content");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await API.put('/content/about', form);
      if (res.data.success) {
        toast.success("About Us content updated");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LogoLoader />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage About Us</h2>
      </div>

      <CardShell icon={FiInfo}>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div className="bg-green-50 p-4 rounded-lg text-green-800 text-sm flex gap-3 border border-green-100">
             <FiInfo className="shrink-0 mt-0.5 text-green-600" size={18} />
             <p>Write your "About Us" content below. Simply use the <b>Enter</b> key to start new paragraphs. No need to use any HTML tags.</p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Section Title</label>
            <input 
              required 
              type="text" 
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Content (Description)</label>
            <textarea 
              required 
              rows="15" 
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed" 
              value={form.content} 
              onChange={e => setForm({...form, content: e.target.value})} 
              placeholder="Write your company information here..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-bold shadow-md hover:bg-primary-700 flex items-center gap-2 disabled:bg-primary-400"
            >
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </CardShell>
    </div>
  );
};

export default AboutUs;
