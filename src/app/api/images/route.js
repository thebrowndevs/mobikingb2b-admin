// api/images/route.js
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "mobiking",
            resource_type: "auto",
        });

        console.log("Cloudinary Response:", uploadResponse);

        return NextResponse.json({ imageURL: uploadResponse.secure_url }, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: error }, { status: 500 });
    }
}

export async function GET() {
    // const errorResponse = await requirePermissionApi(req, Resources.MEDIA, Actions.VIEW);
    // if (errorResponse) return errorResponse;
    try {
        const result = await cloudinary.search
            .expression('folder:mobiking')
            .sort_by('created_at', 'desc')
            .max_results(100)
            .execute();

        const images = result.resources.map((img) => ({
            id: img.asset_id,
            public_id: img.public_id,
            url: img.secure_url,
            format: img.format,
            width: img.width,
            height: img.height,
            size: Math.round(img.bytes / 1024), // size in KB
            created_at: img.created_at,
        }));

        return NextResponse.json(images, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    // const errorResponse = await requirePermissionApi(req, Resources.MEDIA, Actions.DELETE);
    // if (errorResponse) return errorResponse;
    try {
        let { publicId } = await req.json();

        console.log(publicId)

        if (!publicId) {
            return NextResponse.json(
                { error: 'Public ID is required' },
                { status: 400 }
            );
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok') {
            return NextResponse.json(
                { error: 'Failed to delete image' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Image deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        NextResponse.json(
            { error: error.message },
            { status: 500 }
        );

    }
}

