"use client"
import React ,{useState}from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'
import { useAuth } from '@clerk/nextjs'


function VideoUpload() {
    const[file,setFile]=useState<File | null>(null);
    const[title,setTitle]=useState("");
    const[description,setDescription]=useState("");
    const[isUploading,setIsUploading]=useState(false);
    const { getToken } = useAuth();
  
    const router=useRouter();
    const MAX_FILE_SIZE=70*1024*1024; //70mb

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!file){
        alert("Please select a file to upload");
        return;
      }
      if(file.size>MAX_FILE_SIZE){
        alert("File size exceeds the 70mb limit");
        return;
      }

      setIsUploading(true);
      const formData=new FormData();
      formData.append("file",file);
      formData.append("title",title);
      formData.append("description",description);
      formData.append("originalSize",file.size.toString());
    
      try{
        const token = await getToken();
        const response= await axios.post("/api/video-upload",formData,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.data && response.data.video) {
          router.push("/home");
        }
      }catch(error  ){
        console.error("Error uploading video:",error);
        alert("Failed to upload video");
      }
      finally{
        setIsUploading(false);
      }
   
    }



  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Upload Video</h1>
        <p className="text-gray-400 mt-2">Publish your content to the showcase.</p>
      </div>

      <div className="bg-[#141416] border border-[#262626] rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#262626] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="Give your video a catchy title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#262626] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors h-32 resize-none"
              placeholder="What is this video about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-[#0a0a0a] border border-[#262626] text-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 file:cursor-pointer file:transition-colors cursor-pointer"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Uploading to Cloudinary...
              </>
            ) : "Publish Video"}
          </button>
        </form>

        {isUploading && (
          <div className="mt-6">
            <div className="w-full bg-[#0a0a0a] rounded-full h-2 overflow-hidden border border-[#262626]">
              <div className="bg-indigo-500 h-full rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2 font-medium">Compressing and processing...</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default VideoUpload;