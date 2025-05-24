# Use an official Node runtime as a parent image
# Built on top a linux image
FROM node:18

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.kson and package-lock.json into the working directory
COPY package*.json ./

# Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# Install needed packages specified in package.json
RUN npm install

# Copy app source code inside the docker image (everything in directory)
COPY . . 

# Expose port 3000 to be available outside the container
EXPOSE 3000

# Define the command to run the app using CMD (only one CMD call allowed)
# Used to start up the container
CMD [ "npm", "start" ]

# Put node_modules in .dockerignore
# No need to copy modules over, since npm install will install all packages from the package.jsons


# Build the docker image
# -t tag applies a name to the image
# Specify . for root directory
# docker pull node:18
# video-processing-service % docker build -t video-processing-service .

# Run docker image by image id or name
# -p for port forwarding (port might not be available on host system so forward from docker container)
# -d to detach (allows for more commands to be entered)
# docker run -p 3000:3000 -d video-processing-service

# docker ps (to list docker containers)

# Copy video file from host system to docker container (with container id or name) (located in app directory)
# docker cp ./test.mov nifty_leakey:/app/test.mov

# Copy video file from docker container to host system
# docker cp nifty_leakey:/app/processed-test.mov ./processed-test.mov 

# Stop container (with container id or name)
# docker stop nifty_leakey

# Remove container 
# docker remove nifty_leakey

# Remove image (not recommended)
# docker image rm nifty_leakey



# # Stage 1: Build stage
# FROM node:18 AS builder

# # Set the working directory in the container to /app
# WORKDIR /app

# # Copy package.json and package-lock.json into the working directory
# COPY package*.json ./

# # Install any needed packages specified in package.json
# RUN npm install

# # Bundle app source inside the docker image
# COPY . .

# # Build the app
# RUN npm run build

# # Stage 2: Production stage
# FROM node:18

# # Install ffmpeg in the container
# RUN apt-get update && apt-get install -y ffmpeg

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install only production dependencies
# RUN npm install --only=production

# # Copy built app from the builder stage
# COPY --from=builder /app/dist ./dist

# # Make port 3000 available to the world outside this container
# EXPOSE 3000

# # Define the command to run your app using CMD which defines your runtime
# CMD [ "npm", "run", "serve" ]