"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation, Thumbs } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/thumbs"

export default function ImageGallery({ images = [], fullName = "" }) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null)

    return (
        <div className="w-full">
            {/* Main Swiper for Large Image */}
            <Swiper
                loop={true}
                spaceBetween={10}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Thumbs, Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                className="rounded-sm border bg-white"
            >
                {images.map((img, index) => (
                    <SwiperSlide key={index}>
                        <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
                            <Image
                                src={img}
                                alt={`${fullName} - ${index}`}
                                width={1000}
                                height={1000}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Thumbnail Swiper */}
            <div className="mt-4">
                <Swiper
                    onSwiper={setThumbsSwiper}
                    loop={true}
                    spaceBetween={10}
                    slidesPerView={4}
                    watchSlidesProgress={true}
                    modules={[Thumbs]}
                    className="thumb-swiper"
                    breakpoints={{
                        640: {
                            slidesPerView: 5,
                        },
                        1024: {
                            slidesPerView: 6,
                        },
                    }}
                >
                    {images.map((img, index) => (
                        <SwiperSlide key={`thumb-${index}`} className="cursor-pointer">
                            <div className="aspect-square overflow-hidden rounded-sm border">
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index}`}
                                    width={100}
                                    height={100}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    )
}
