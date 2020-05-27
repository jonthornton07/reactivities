using System;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Domain;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Application.Activities
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivitiesController
    {
        public readonly IMediator _mediator;
        public ActivitiesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Activity>>> List()
        {
            return await _mediator.Send(new List.Query());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Activity>> Details(Guid id)
        {
            return await _mediator.Send(new Details.Query { Id = id });
        }

        [HttpPost]
        public async Task<ActionResult<Unit>> Create(Create.Command command)
        {
            return await _mediator.Send(command);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Unit>> Edit(Guid id, Edit.Command command)
        {
            command.Id = id;
            return await _mediator.Send(command);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Unit>> Delete(Guid id, Delete.Command command)
        {
            command.Id = id;
            return await _mediator.Send(command);
        }
    }
}