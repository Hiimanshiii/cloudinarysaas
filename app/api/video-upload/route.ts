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
            const body = await request.json();
            const { title, description, originalSize, publicId, compressedSize, duration } = body;

            if(!publicId){
                return NextResponse.json({error:"No publicId provided"},{status:400})
            }

            const video=await prisma.video.create({
                data:{
                    title,
                    description,
                    originalSize,
                    compressedSize,
                    publicId,
                    duration
                }
            })   
            return NextResponse.json({video})    
        }
        catch(error){
            console.error("Error saving video metadata:",error);
            return NextResponse.json({error:"Failed to save video metadata"},{status:500})
        }   finally{
            await prisma.$disconnect();
        }
}