import graphene
from api.models import Activo
from graphene_django import DjangoObjectType

class ActivosType(DjangoObjectType):
    class Meta:
        model = Activo
        fields = ('id', 'ticker' , 'precio')


class Query(graphene.ObjectType):
    hello = graphene.String(default_value="Hi!")
    activos = graphene.List(ActivosType)
    activo = graphene.Field(ActivosType, id=graphene.ID())

    def resolve_activos(self, info):
        return Activo.objects.all()
    
    def resolve_activo(self,info,id):
        return Activo.objects.get(id=id)

schema = graphene.Schema(query=Query)   