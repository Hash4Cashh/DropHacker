"use client"

import React from 'react'

export default function inputTextDisabled({label = "", value="", setValue = () => {}, disabled = true}) {
  return (
    <div className="relative" data-te-input-wrapper-init>
            {/* <input
              type="text"
              className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
              id="exampleFormControlInput1"
              // readonly
              // value={"ETH"}
               /> */}
            <input
              type="text"
              className="peer block min-h-[auto] rounded border-0 bg-neutral-100 px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear"
              // id="label"
              value={value}
              onChange={setValue}
              // placeholder='ETH'
              aria-label="readonly input example"
              readOnly={disabled}
            />
            <label
              // for="exampleFormControlInput1"
              className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out -translate-y-[0.9rem] scale-[0.8] text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
            >
              {label}
            </label>
          </div>
  )
}
