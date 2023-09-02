export const isAuthorized = (role) => {
  return (req, res, next) => {
    // check role >>>>> role, user role
    if (role !== req.user.role)
      return next(new Error("Not authorized!", { cause: 401 }));

    return next();
  };
};
