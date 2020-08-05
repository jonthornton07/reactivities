using System.Net;
using System;

namespace Application.Errors
{
    public class RestException : Exception
    {

        public HttpStatusCode Code { get; set; }
        public Object Errors { get; set; }

        public RestException(HttpStatusCode code, object errors = null)
        {
            Code = code;
            Errors = errors;
        }

    }

}