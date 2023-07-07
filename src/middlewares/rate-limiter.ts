import rateLimiter from "express-rate-limit";

export const limiter = rateLimiter({
  max: 120,
  windowMs: 5000,
  message: "You can't make any more requests at the moment. Try again later",
});

export const signInLimiter = rateLimiter({
  max: 3,
  windowMs: 60000,
  message: "Too many sign-in attempts, Try again in 60 seconds.",
});
