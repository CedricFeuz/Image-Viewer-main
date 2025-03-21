"use client";

import React, { useState, useEffect } from "react";
import Excel from "./Excel";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center h-screen w-screen">
      <Excel />
    </div>
  );
}
