import { NextResponse } from 'next/server'
import { taskOptions } from '@public/taskOptions';
 
export async function GET() {
  return NextResponse.json(taskOptions)
}