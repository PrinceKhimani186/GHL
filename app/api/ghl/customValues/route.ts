import { NextResponse } from "next/server";

const BASE_URL = "https://services.leadconnectorhq.com";

const headers = {
  Authorization: `${process.env.NEXT_PUBLIC_GHL_API_KEY}`,
  Version: "2021-07-28",
  Accept: "application/json",
  "Content-Type": "application/json",
};

/* ======================
   GET: FETCH CUSTOM VALUES
   ====================== */
export async function GET() {
  try {
    const res = await fetch(
      `${BASE_URL}/locations/6Fgrrk5Lnc2jYZHBDaFN/customValues`,
      {
        method: "GET",
        headers : {
          Authorization: `${process.env.NEXT_PUBLIC_GHL_API_KEY}`,
          Version: "2021-07-28",
          Accept: "application/json",
       },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GHL GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch custom values" },
      { status: 500 }
    );
  }
}

/* ======================
   PUT: UPDATE CUSTOM VALUES
   ====================== */
export async function PUT(req: Request) {
  try {
    const { updates } = await req.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    for (const item of updates) {
      await fetch(
        `${BASE_URL}/locations/6Fgrrk5Lnc2jYZHBDaFN/customValues/${item.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ name: item.name, value:item.value }),
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("GHL PUT Error:", err);
    return NextResponse.json(
      { error: "Failed to update custom values" },
      { status: 500 }
    );
  }
}
