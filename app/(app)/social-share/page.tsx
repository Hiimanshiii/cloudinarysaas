"use client"
import React,{useState,useRef,useEffect}from 'react'
import {CldVideoPlayer} from 'next-cloudinary';
import { CldImage } from 'next-cloudinary';
const SocialFormats={
  "Instagram Sqaure(1:1)":{width:1080,height:1080,aspectRatio:"1:1"},
  "Instagram Portrait(4:5)":{width:1080,height:1350,aspectRatio:"4:5"},
  "Instagram Story(9:16)":{width:1080,height:1920,aspectRatio:"9:16"},
  "Facebook Feed(205:78)":{width:820,height:312,aspectRatio:"205:78"},
  "Twitter Feed(16:9)":{width:1200,height:675,aspectRatio:"16:9"},
  "Twitter Story(16:9)":{width:1200,height:675,aspectRatio:"16:9"},
};

type SocialFormat = keyof typeof SocialFormats;  

export default function SocialShare() {
  const [uploadedImage,setuploadedImage]=useState<string | null>(null);
  const [selectedFormat,setSelectedFormat]=useState<SocialFormat>("Instagram Sqaure(1:1)");
  const [isTransforming,setIsTransforming]=useState(false);
  const imageRef=useRef<HTMLImageElement>(null);

  useEffect(()=>{
    if(uploadedImage){
      setIsTransforming(true);
    }
  },[selectedFormat,uploadedImage])

  const handleFileUpload=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];
    if(!file)return;
    setIsTransforming(true);  
    const formData=new FormData();
    formData.append("file",file);
    
    try {
      const response=await fetch("/api/image-upload",{
        method:"POST",
        body:formData
      });
      
      if(!response.ok) throw new Error("Failed to upload");

      const data=await response.json();
      if(data.url){
        setuploadedImage(data.url);
      } else {
        setIsTransforming(false);
      }
    } catch (error) {
      console.error(error);
      setIsTransforming(false);
    }
  } 

  const handleDownload=()=>{
     if (!uploadedImage || !imageRef.current) return;
 
    
    fetch(imageRef.current.src).then((res)=>res.blob()).then((blob)=>{
      const url=window.URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.href=url;
      link.download=`${selectedFormat}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);  
      document.body.removeChild(link);
    }) 
  } 

   const format = SocialFormats[selectedFormat];
 
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Social Media Image Creator</h1>
        <p className="text-gray-400 mt-2">Format and crop your images for various platforms.</p>
      </div>

      <div className="bg-[#141416] border border-[#262626] rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-medium text-white mb-6">Upload an Image</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Choose an image file
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full bg-[#0a0a0a] border border-[#262626] text-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600/10 file:text-indigo-400 hover:file:bg-indigo-600/20 file:cursor-pointer file:transition-colors cursor-pointer"
          />
        </div>

        {isTransforming && (
          <div className="mt-6">
            <div className="w-full bg-[#0a0a0a] rounded-full h-2 overflow-hidden border border-[#262626]">
              <div className="bg-indigo-500 h-full rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2 font-medium">Processing image...</p>
          </div>
        )}

        {uploadedImage && (
          <div className="mt-8 pt-8 border-t border-[#262626]">
            <h2 className="text-lg font-medium text-white mb-6">
              Select Social Media Format
            </h2>

            <div>
              <select
                className="w-full bg-[#0a0a0a] border border-[#262626] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors appearance-none"
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as SocialFormat)
                }
              >
                {Object.keys(SocialFormats).map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="mt-8 relative">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Preview</h3>

              <div className="flex justify-center bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden min-h-[300px] relative items-center p-4">
                {isTransforming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#141416]/80 backdrop-blur-sm z-10 transition-opacity">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  </div>
                )}

                <CldImage
                  width={SocialFormats[selectedFormat].width}
                  height={SocialFormats[selectedFormat].height}
                  src={uploadedImage}
                  sizes="100vw"
                  alt="Transformed image"
                  crop="fill"
                  gravity="auto"
                  ref={imageRef}
                  aspectRatio={SocialFormats[selectedFormat].aspectRatio}
                  onLoad={() => setIsTransforming(false)}
                  className="rounded-md shadow-lg max-h-[600px] w-auto object-contain"
                />
              </div>
            </div>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-50"
            >
              Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

