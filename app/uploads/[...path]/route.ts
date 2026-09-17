import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // If we reach this route, it means the file was NOT found in the local `public/uploads` folder.
  // We will redirect the browser directly to the production site so it can fetch the image.
  
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { path } = await params;
  const imagePath = path.join("/");
  return NextResponse.redirect(`https://dristitimes.com/uploads/${imagePath}`);
}
