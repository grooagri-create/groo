import React, { useState, useEffect } from "react";
import { FiSave, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CardShell from "../../components/CardShell";
import API from "../../../../services/api";
import LogoLoader from "../../../../components/common/LogoLoader";
import { uploadToCloudinary } from "../../../../services/cloudinaryService";
import { FiImage, FiX } from "react-icons/fi";

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: "About GROO",
    content: "",
    images: []
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
          content: res.data.data.content || "",
          images: res.data.data.images || []
        });
      }
    } catch (error) {
      toast.error("Failed to load About Us content");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    

    try {
      const loadingToast = toast.loading(`Uploading ${files.length} image(s)...`);
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      
      const newImages = urls.map(url => ({ url, name: "" }));
      
      setForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newImages] 
      }));
      
      toast.dismiss(loadingToast);
      toast.success("Images uploaded!");
    } catch (error) {
      toast.error("Failed to upload images");
    }
  };

  const handleNameChange = (index, name) => {
    const updatedImages = [...form.images];
    updatedImages[index].name = name;
    setForm({ ...form, images: updatedImages });
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
              rows="10" 
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none leading-relaxed" 
              value={form.content} 
              onChange={e => setForm({...form, content: e.target.value})} 
              placeholder="Write your company information here..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Featured Images (About Section)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {form.images.map((img, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                    <img src={img.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                  <input 
                    type="text"
                    placeholder="Image label (e.g. Rental)"
                    className="w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-primary-500 outline-none"
                    value={img.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                  />
                </div>
              ))}
              
              <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group shadow-sm">
                <FiImage className="w-8 h-8 mb-1 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Add Image</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-3">These images and their names will appear on the homepage About section.</p>
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
