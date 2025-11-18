import React from 'react'

function Card({item}) {
  return (
    <>
    <div className='h-84 w-80  p-3 '>
        <div className='h-50  mb-3 '>
            <img className=' object-cover h-full w-full' src="https://i.cdn.newsbytesapp.com/images/l68620230306133349.png"/>
        </div>
        <div>
            <h1 className=''>cdvsfgbfh</h1>
            <div className='flex justify-between mb-2 '>
                <h1>rating</h1>
                <h1>price</h1>
            </div>
            <button className='text-sm text-white bg-black px-10 py-2 rounded-2xl mr-2'>Add to Cart</button>
            <button className='text-sm px-10 py-2 bg-gray-300 rounded-2xl'>Buy Now</button>
        </div>
    </div>
    </>
  )
}

export default Card