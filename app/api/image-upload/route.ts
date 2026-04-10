import { NextRequest,NextResponse } from "next/server";
import {v2 as cloudinary} from 'cloudinary';
import {auth} from '@clerk/nextjs/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

interface cloudinaryUploadResult{
    public_id:string;
    secure_url:string;
    error?:{message:string}
}

export async function POST(request:NextRequest){
        const { userId } = await auth();
        if(!userId){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }

        if(
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ){
            return NextResponse.json({error:"Cloudinary credentials not found"},{status:500})
        }
        try{
        const formData = await request.formData();
        const file = formData.get('file') as File;
        if(!file){
            return NextResponse.json({error:"No file uploaded"},{status:400})
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const result = await new Promise<cloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "next-cloudinary-uploads",
                    resource_type: 'image',
                    transformation: [{width:800,crop:'scale'}]
                },
                (error,result)=>{
                    if(error){
                        console.error("Upload error:",error);
                        reject(error);
                    } else {
                        resolve(result as cloudinaryUploadResult);
                    }
                }
            )
            uploadStream.end(buffer);
        })
        
        return NextResponse.json({url:result?.secure_url, publicId: result?.public_id})
    }
    catch(error){
        console.error("Error in image upload:",error);
        return NextResponse.json({error:"Upload failed"},{status:500})
    }   
}