import React from 'react'

const Loading = () => {
  return (
    <div>
      <video id='videoLoop' autoPlay loop muted>
      <source id="animation" src="./loading.webm" type="video/webm" />
      </video>
    </div>
  )
}

export default Loading
