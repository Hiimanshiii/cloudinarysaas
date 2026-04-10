import { NextRequest,NextResponse } from "next/server";
import {v2 as cloudinary} from 'cloudinary';
import {auth} from '@clerk/nextjs/server';
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ?? new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

interface cloudinaryUploadResult{
    public_id:string;
    secure_url:string;
    error?:{message:string};
    bytes:number;
    duration?:number 
}

export async function POST(request:NextRequest){
        const { userId } = await auth();
        if(!userId){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }
        if(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
            return NextResponse.json({error:"Cloudinary configuration is not set"},{status:500})
        }

        try{
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title=formData.get('title') as string;
        const description=formData.get('description') as string;
        const originalSize=formData.get('originalSize') as string; 
        if(!file){
            return NextResponse.json({error:"No file uploaded"},{status:400})
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const result = await new Promise<cloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "video-uploads",
                    resource_type: 'video',
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

        const video=await prisma.video.create({
            data:{
                title,
                description,
                originalSize,
                compressedSize: String(result?.bytes || 0),
                publicId:result?.public_id || "",
                duration:result?.duration || 0
            }
        })   
        return NextResponse.json({video})    
    }
    catch(error){
        console.error("Error in video upload:",error);
        return NextResponse.json({error:"Upload failed"},{status:500})
    }   finally{
        await prisma.$disconnect();
    }
}