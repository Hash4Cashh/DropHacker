"use client"

import React from 'react'
import { IBtnProps } from './btnTemplate'

export function BtnText({text, onClick, color}: IBtnProps) {
  return (
    <button className={`btn btn-text upper font-black ${color}`} onClick={onClick}>
        {text}
    </button>
  )
}
